import type { PrismaClient } from '@prisma/client'
import { redis } from './redis.js'
import { getSeenList } from './seen-list.js'
import { getMatchingIntentionIds } from './intention-index.js'
import { computeIntentionScore, computeFinalScore } from './intention-scoring.js'
import type { IntentionForScoring, ProfileForScoring } from './intention-scoring.js'
import { getKudosScore } from './kudos.js'

const FEED_CACHE_TTL = 900 // 15 minutes

const FEMALE_PRESENTING_GENDERS = new Set([
  'WOMAN',
  'TRANS_WOMAN',
  'NON_BINARY',
  'GENDERQUEER',
  'GENDERFLUID',
  'AGENDER',
  'BIGENDER',
  'TWO_SPIRIT',
])

const MALE_PRESENTING_GENDERS = new Set(['MAN', 'TRANS_MAN'])

async function getGatekeeperPassRate(prisma: PrismaClient, userId: string): Promise<number> {
  const [total, passed] = await Promise.all([
    prisma.gatekeeperConversation.count({
      where: { senderId: userId, status: { in: ['PASSED', 'FAILED'] } },
    }),
    prisma.gatekeeperConversation.count({
      where: { senderId: userId, status: 'PASSED' },
    }),
  ])
  return total > 0 ? Math.round((passed / total) * 100) : 50
}

export interface IntentionFeedItem {
  userId: string
  displayName: string
  compatibilityScore: number
  matchedIntentionTags: string[]
  bioSnippet: string
  photoUrl: string | null
  intentionSeeking: string
  distance: number | null
  isFallback: boolean
}

type IntentionWithRelations = {
  id: string
  userId: string
  seeking: string
  genderPreferences: string[]
  ageMin: number
  ageMax: number
  distanceRadiusKm: number
  orientationMatch: string[]
  availability: string
  relationshipStructure: string | null
  status: string
  kinkTags: { kinkTagId: string }[]
  user: {
    profile: {
      displayName: string
      bio: string | null
      age: number
      gender: string
      orientation: string
      spicyModeEnabled: boolean
      photos: { url: string; position: number }[]
    } | null
  } | null
}

type ProfileWithRelations = {
  userId: string
  gender: string
  orientation: string
  age: number
  spicyModeEnabled: boolean
}

export async function generateIntentionFeed(
  prisma: PrismaClient,
  sourceIntention: IntentionWithRelations,
  sourceProfile: ProfileWithRelations,
  sourceUserId: string,
  cursor?: string,
  limit = 20
): Promise<{ results: IntentionFeedItem[]; nextCursor: string | null }> {
  // Step 1: Get seen list for the source user
  const seenList = await getSeenList(redis, sourceUserId)
  const seenSet = new Set(seenList)

  // Step 2: Get matching intention IDs from Redis index for each gender preference
  const intentionIdSets = await Promise.all(
    sourceIntention.genderPreferences.map((gender) =>
      getMatchingIntentionIds(sourceIntention.seeking, gender)
    )
  )

  const allIntentionIds = [...new Set(intentionIdSets.flat())]

  if (allIntentionIds.length === 0) {
    return { results: [], nextCursor: null }
  }

  // Step 3: Fetch matching intentions from DB with their user profiles
  const candidates = await prisma.intention.findMany({
    where: {
      id: { in: allIntentionIds },
      status: 'ACTIVE',
    },
    include: {
      kinkTags: true,
      user: {
        include: {
          profile: {
            include: {
              photos: {
                orderBy: { position: 'asc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  }) as IntentionWithRelations[]

  // Step 4: Filter out source user's own intentions, seen users, and same-user intentions
  const filtered = candidates.filter((intention) => {
    if (intention.userId === sourceUserId) return false
    if (seenSet.has(intention.userId)) return false
    return true
  })

  // Step 5: Kvinnor-forst enforcement
  // If source user is female-presenting, male-presenting candidates must have a reciprocal active intention
  const sourceFemalePresenting = FEMALE_PRESENTING_GENDERS.has(sourceProfile.gender)

  let kvinnorFiltered: IntentionWithRelations[]

  if (sourceFemalePresenting) {
    // Gather all male-presenting candidate userIds for batch check
    const malePresentingUserIds = filtered
      .filter((intention) => {
        const profile = intention.user?.profile
        return profile && MALE_PRESENTING_GENDERS.has(profile.gender)
      })
      .map((i) => i.userId)

    // Fetch active intentions from male-presenting candidates that explicitly target the source user's gender
    const reciprocalIntentions = await prisma.intention.findMany({
      where: {
        userId: { in: malePresentingUserIds },
        status: 'ACTIVE',
        seeking: sourceIntention.seeking,
      },
      select: {
        userId: true,
        genderPreferences: true,
      },
    })

    // Build a set of male-presenting userIds that have a qualifying reciprocal intention
    const qualifiedMaleUserIds = new Set(
      reciprocalIntentions
        .filter((i) => i.genderPreferences.includes(sourceProfile.gender))
        .map((i) => i.userId)
    )

    kvinnorFiltered = filtered.filter((intention) => {
      const profile = intention.user?.profile
      if (!profile) return false
      if (MALE_PRESENTING_GENDERS.has(profile.gender)) {
        return qualifiedMaleUserIds.has(intention.userId)
      }
      return true
    })
  } else {
    kvinnorFiltered = filtered
  }

  // Step 6: Score remaining candidates
  const sourceIntentionForScoring: IntentionForScoring = {
    id: sourceIntention.id,
    userId: sourceIntention.userId,
    seeking: sourceIntention.seeking,
    genderPreferences: sourceIntention.genderPreferences,
    ageMin: sourceIntention.ageMin,
    ageMax: sourceIntention.ageMax,
    distanceRadiusKm: sourceIntention.distanceRadiusKm,
    orientationMatch: sourceIntention.orientationMatch,
    availability: sourceIntention.availability,
    relationshipStructure: sourceIntention.relationshipStructure,
    kinkTags: sourceIntention.kinkTags,
  }

  const sourceProfileForScoring: ProfileForScoring = {
    gender: sourceProfile.gender,
    orientation: sourceProfile.orientation,
    age: sourceProfile.age,
    spicyModeEnabled: sourceProfile.spicyModeEnabled,
  }

  type ScoredCandidate = {
    intention: IntentionWithRelations
    score: number
    matchedTags: string[]
  }

  const sourceTags = new Set(sourceIntention.kinkTags.map((t) => t.kinkTagId))

  const scored: ScoredCandidate[] = kvinnorFiltered
    .map((intention) => {
      const profile = intention.user?.profile
      if (!profile) return null

      const candidateForScoring: IntentionForScoring = {
        id: intention.id,
        userId: intention.userId,
        seeking: intention.seeking,
        genderPreferences: intention.genderPreferences,
        ageMin: intention.ageMin,
        ageMax: intention.ageMax,
        distanceRadiusKm: intention.distanceRadiusKm,
        orientationMatch: intention.orientationMatch,
        availability: intention.availability,
        relationshipStructure: intention.relationshipStructure,
        kinkTags: intention.kinkTags,
      }

      const candidateProfileForScoring: ProfileForScoring = {
        gender: profile.gender,
        orientation: profile.orientation,
        age: profile.age,
        spicyModeEnabled: profile.spicyModeEnabled,
      }

      const score = computeIntentionScore(
        sourceIntentionForScoring,
        candidateForScoring,
        sourceProfileForScoring,
        candidateProfileForScoring
      )

      const matchedTags = intention.kinkTags
        .map((t) => t.kinkTagId)
        .filter((id) => sourceTags.has(id))

      return { intention, score, matchedTags }
    })
    .filter((item): item is ScoredCandidate => item !== null)

  // Step 6b: Enhance scores with gatekeeper pass rate and kudos score
  const candidateUserIds = scored.map((s) => s.intention.userId)
  const [kudosScores, gatekeeperRates] = await Promise.all([
    Promise.all(candidateUserIds.map((uid) => getKudosScore(prisma, uid))),
    Promise.all(candidateUserIds.map((uid) => getGatekeeperPassRate(prisma, uid))),
  ])

  scored.forEach((item, i) => {
    item.score = computeFinalScore(item.score, gatekeeperRates[i], kudosScores[i])
  })

  // Step 7: Sort by score descending
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.intention.id.localeCompare(b.intention.id)
  })

  // Step 8: Apply cursor-based pagination
  // Cursor format: "<score>:<intentionId>"
  let startIndex = 0

  if (cursor) {
    const separatorIndex = cursor.lastIndexOf(':')
    if (separatorIndex !== -1) {
      const cursorScore = parseFloat(cursor.substring(0, separatorIndex))
      const cursorId = cursor.substring(separatorIndex + 1)
      const idx = scored.findIndex(
        (item) => item.score === cursorScore && item.intention.id === cursorId
      )
      if (idx !== -1) {
        startIndex = idx + 1
      }
    }
  }

  const page = scored.slice(startIndex, startIndex + limit)
  const lastItem = page[page.length - 1]
  const nextCursor =
    page.length === limit && startIndex + limit < scored.length
      ? `${lastItem.score}:${lastItem.intention.id}`
      : null

  // Step 9: Map to IntentionFeedItem
  const results: IntentionFeedItem[] = page.map(({ intention, score, matchedTags }) => {
    const profile = intention.user!.profile!
    const photoUrl = profile.photos.length > 0 ? profile.photos[0].url : null
    const bio = profile.bio ?? ''
    const bioSnippet = bio.length > 120 ? bio.substring(0, 120) + '…' : bio

    return {
      userId: intention.userId,
      displayName: profile.displayName,
      compatibilityScore: score,
      matchedIntentionTags: matchedTags,
      bioSnippet,
      photoUrl,
      intentionSeeking: intention.seeking,
      distance: null,
      isFallback: false,
    }
  })

  // Step 10: Cold-start fallback — if fewer than 5 results and no cursor, fetch baseline matches
  if (results.length < 5 && !cursor) {
    const existingUserIds = results.map((r) => r.userId)
    const fallbackProfiles = await prisma.profile.findMany({
      where: {
        userId: { notIn: [sourceUserId, ...existingUserIds, ...Array.from(seenSet)] },
        gender: { in: sourceIntention.genderPreferences as any },
        age: { gte: sourceIntention.ageMin, lte: sourceIntention.ageMax },
      },
      include: {
        photos: { orderBy: { position: 'asc' }, take: 1 },
      },
      take: 5 - results.length,
    })

    for (const profile of fallbackProfiles) {
      results.push({
        userId: profile.userId,
        displayName: profile.displayName,
        compatibilityScore: 0,
        matchedIntentionTags: [],
        bioSnippet: (profile.bio ?? '').substring(0, 120),
        photoUrl: profile.photos[0]?.url ?? null,
        intentionSeeking: sourceIntention.seeking,
        distance: null,
        isFallback: true,
      })
    }
  }

  return { results, nextCursor }
}

export function intentionFeedCacheKey(intentionId: string): string {
  return `intention:feed:${intentionId}`
}

export async function invalidateIntentionFeedCache(intentionId: string): Promise<void> {
  await redis.del(intentionFeedCacheKey(intentionId))
}
