import { redis } from './redis.js'

export const SCORING_WEIGHTS = {
  SEEKING_MATCH: 0.25,
  GENDER_ORIENTATION: 0.20,
  AGE_OVERLAP: 0.15,
  DISTANCE: 0.15,
  AVAILABILITY: 0.10,
  KINK_OVERLAP: 0.15,
}

export const MUTUAL_BOOST_MULTIPLIER = 1.2

export const RANKING_WEIGHTS = {
  INTENTION_SCORE: 0.55,
  TRUST_SCORE: 0.25,
  GATEKEEPER_PASS_RATE: 0.10,
  KUDOS_SCORE: 0.10,
}

const SCORE_CACHE_TTL = 21600 // 6 hours

export interface IntentionForScoring {
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
  kinkTags: { kinkTagId: string }[]
}

export interface ProfileForScoring {
  gender: string
  orientation: string
  age: number
  spicyModeEnabled: boolean
}

export interface ScoredResult {
  intentionId: string
  userId: string
  score: number
  matchedTags: string[]
}

// Pairs of seeking values that are considered complementary
const COMPLEMENTARY_SEEKING_PAIRS: Array<[string, string]> = [
  ['CASUAL', 'CASUAL'],
  ['RELATIONSHIP', 'RELATIONSHIP'],
  ['FRIENDSHIP', 'FRIENDSHIP'],
  ['EXPLORATION', 'EXPLORATION'],
  ['EVENT', 'EVENT'],
  ['OTHER', 'OTHER'],
]

function isComplementarySeeking(seekingA: string, seekingB: string): boolean {
  return COMPLEMENTARY_SEEKING_PAIRS.some(
    ([a, b]) => (seekingA === a && seekingB === b) || (seekingA === b && seekingB === a)
  )
}

function scoreSeekingMatch(seekingA: string, seekingB: string): number {
  if (seekingA === seekingB) return 100
  if (isComplementarySeeking(seekingA, seekingB)) return 50
  return 0
}

function scoreGenderOrientation(
  intentionA: IntentionForScoring,
  intentionB: IntentionForScoring,
  profileA: ProfileForScoring,
  profileB: ProfileForScoring
): number {
  const genderBInA = intentionA.genderPreferences.includes(profileB.gender)
  const genderAInB = intentionB.genderPreferences.includes(profileA.gender)

  if (!genderBInA || !genderAInB) return 0

  const orientationBInA =
    intentionA.orientationMatch.length === 0 ||
    intentionA.orientationMatch.includes(profileB.orientation)
  const orientationAInB =
    intentionB.orientationMatch.length === 0 ||
    intentionB.orientationMatch.includes(profileA.orientation)

  if (genderBInA && genderAInB && orientationBInA && orientationAInB) return 100
  if (genderBInA && genderAInB) return 60
  return 0
}

function scoreAgeOverlap(
  intentionA: IntentionForScoring,
  intentionB: IntentionForScoring,
  profileA: ProfileForScoring,
  profileB: ProfileForScoring
): number {
  // Check if each profile's age falls within the other's range
  const profileBInA = profileB.age >= intentionA.ageMin && profileB.age <= intentionA.ageMax
  const profileAInB = profileA.age >= intentionB.ageMin && profileA.age <= intentionB.ageMax

  if (!profileBInA && !profileAInB) return 0

  // Calculate range overlap
  const overlapMin = Math.max(intentionA.ageMin, intentionB.ageMin)
  const overlapMax = Math.min(intentionA.ageMax, intentionB.ageMax)

  if (overlapMin > overlapMax) {
    // No range overlap — partial credit if at least one age fits
    return profileBInA && profileAInB ? 40 : 20
  }

  const overlapSize = overlapMax - overlapMin
  const rangeA = Math.max(1, intentionA.ageMax - intentionA.ageMin)
  const rangeB = Math.max(1, intentionB.ageMax - intentionB.ageMin)
  const maxRange = Math.max(rangeA, rangeB)
  const overlapRatio = Math.min(1, overlapSize / maxRange)

  const ageInRangeBonus = profileBInA && profileAInB ? 30 : 15
  return Math.min(100, Math.round(overlapRatio * 70 + ageInRangeBonus))
}

function scoreDistance(
  intentionA: IntentionForScoring,
  intentionB: IntentionForScoring,
  distanceKm: number
): number {
  const maxRadius = Math.max(intentionA.distanceRadiusKm, intentionB.distanceRadiusKm)
  return Math.max(0, 100 - (distanceKm / maxRadius) * 100)
}

function scoreAvailability(availabilityA: string, availabilityB: string): number {
  if (availabilityA === 'FLEXIBLE' || availabilityB === 'FLEXIBLE') return 100
  if (availabilityA === availabilityB) return 100
  return 0
}

function scoreKinkOverlap(
  intentionA: IntentionForScoring,
  intentionB: IntentionForScoring
): { score: number; matchedTags: string[] } {
  const tagsA = new Set(intentionA.kinkTags.map(t => t.kinkTagId))
  const tagsB = new Set(intentionB.kinkTags.map(t => t.kinkTagId))

  const matched = [...tagsA].filter(tag => tagsB.has(tag))
  const maxCount = Math.max(tagsA.size, tagsB.size)

  if (maxCount === 0) return { score: 50, matchedTags: [] }

  const score = Math.round((matched.length / maxCount) * 100)
  return { score, matchedTags: matched }
}

export function computeIntentionScore(
  intentionA: IntentionForScoring,
  intentionB: IntentionForScoring,
  profileA: ProfileForScoring,
  profileB: ProfileForScoring,
  distanceKm = 0
): number {
  const seekingScore = scoreSeekingMatch(intentionA.seeking, intentionB.seeking)
  const genderOrientationScore = scoreGenderOrientation(intentionA, intentionB, profileA, profileB)
  const ageScore = scoreAgeOverlap(intentionA, intentionB, profileA, profileB)
  const distanceScore = scoreDistance(intentionA, intentionB, distanceKm)
  const availabilityScore = scoreAvailability(intentionA.availability, intentionB.availability)

  const bothSpicy = profileA.spicyModeEnabled && profileB.spicyModeEnabled
  const { score: kinkScore } = scoreKinkOverlap(intentionA, intentionB)

  let rawScore: number

  if (bothSpicy) {
    rawScore =
      seekingScore * SCORING_WEIGHTS.SEEKING_MATCH +
      genderOrientationScore * SCORING_WEIGHTS.GENDER_ORIENTATION +
      ageScore * SCORING_WEIGHTS.AGE_OVERLAP +
      distanceScore * SCORING_WEIGHTS.DISTANCE +
      availabilityScore * SCORING_WEIGHTS.AVAILABILITY +
      kinkScore * SCORING_WEIGHTS.KINK_OVERLAP
  } else {
    // Redistribute kink weight evenly across other factors
    const kinkWeight = SCORING_WEIGHTS.KINK_OVERLAP
    const nonKinkTotal =
      SCORING_WEIGHTS.SEEKING_MATCH +
      SCORING_WEIGHTS.GENDER_ORIENTATION +
      SCORING_WEIGHTS.AGE_OVERLAP +
      SCORING_WEIGHTS.DISTANCE +
      SCORING_WEIGHTS.AVAILABILITY

    const redistributionFactor = (nonKinkTotal + kinkWeight) / nonKinkTotal

    rawScore =
      (seekingScore * SCORING_WEIGHTS.SEEKING_MATCH +
        genderOrientationScore * SCORING_WEIGHTS.GENDER_ORIENTATION +
        ageScore * SCORING_WEIGHTS.AGE_OVERLAP +
        distanceScore * SCORING_WEIGHTS.DISTANCE +
        availabilityScore * SCORING_WEIGHTS.AVAILABILITY) *
      redistributionFactor
  }

  const isMutualSeeking = isComplementarySeeking(intentionA.seeking, intentionB.seeking)
  if (isMutualSeeking) {
    rawScore *= MUTUAL_BOOST_MULTIPLIER
  }

  return Math.min(100, Math.round(rawScore))
}

export function computeFinalScore(
  intentionScore: number,
  gatekeeperPassRate: number,
  kudosScore: number,
  trustScore: number = 0
): number {
  return (
    intentionScore * RANKING_WEIGHTS.INTENTION_SCORE +
    trustScore * RANKING_WEIGHTS.TRUST_SCORE +
    gatekeeperPassRate * RANKING_WEIGHTS.GATEKEEPER_PASS_RATE +
    kudosScore * RANKING_WEIGHTS.KUDOS_SCORE
  )
}

export function scoreIntentionsForFeed(
  sourceIntention: IntentionForScoring,
  sourceProfile: ProfileForScoring,
  candidateIntentions: IntentionForScoring[],
  candidateProfiles: Map<string, ProfileForScoring>,
  distanceMap?: Map<string, number>
): ScoredResult[] {
  const results: ScoredResult[] = []

  for (const candidate of candidateIntentions) {
    const candidateProfile = candidateProfiles.get(candidate.userId)
    if (!candidateProfile) continue

    const distanceKm = distanceMap?.get(candidate.userId) ?? 0

    const score = computeIntentionScore(
      sourceIntention,
      candidate,
      sourceProfile,
      candidateProfile,
      distanceKm
    )

    const sourceTagIds = new Set(sourceIntention.kinkTags.map(t => t.kinkTagId))
    const matchedTags = candidate.kinkTags
      .map(t => t.kinkTagId)
      .filter(id => sourceTagIds.has(id))

    results.push({
      intentionId: candidate.id,
      userId: candidate.userId,
      score,
      matchedTags,
    })
  }

  return results.sort((a, b) => b.score - a.score)
}

function scoreCacheKey(idA: string, idB: string): string {
  const [first, second] = [idA, idB].sort()
  return `intention:score:${first}:${second}`
}

export async function getCachedScore(idA: string, idB: string): Promise<number | null> {
  const key = scoreCacheKey(idA, idB)
  const value = await redis.get(key)
  if (value === null) return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

export async function setCachedScore(idA: string, idB: string, score: number): Promise<void> {
  const key = scoreCacheKey(idA, idB)
  await redis.set(key, score.toString(), 'EX', SCORE_CACHE_TTL)
}
