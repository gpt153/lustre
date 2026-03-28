import type { PrismaClient } from '@prisma/client'
import { redis } from './redis.js'
import { getKudosScore } from './kudos.js'

export const TRUST_WEIGHTS = {
  KUDOS: 0.25,
  COMMUNITY: 0.20,
  ACTIVITY: 0.15,
  RESPONSE: 0.15,
  PROFILE_QUALITY: 0.15,
  SAFETY: 0.10,
} as const

const ACTIVITY_SIGNALS = {
  APP_OPEN: { points: 1, decayDays: 14 },
  SWIPE_BATCH: { points: 1, decayDays: 14 },
  MESSAGE_SENT: { points: 2, decayDays: 14 },
  POST_CREATED: { points: 5, decayDays: 14 },
  COMMENT_REACT: { points: 3, decayDays: 14 },
  PROFILE_UPDATE: { points: 3, decayDays: 30 },
  EVENT_ATTEND: { points: 10, decayDays: 30 },
  EVENT_HOST: { points: 20, decayDays: 30 },
} as const

export interface TrustScoreBreakdown {
  kudosScore: number
  activityScore: number
  responseScore: number
  profileQualityScore: number
  communityScore: number
  safetyScore: number
  totalScore: number
}

const ACTIVITY_KEY = (userId: string) => `trust:activity:${userId}`
const SCORE_KEY = (userId: string) => `trust:score:${userId}`

// ---------------------------------------------------------------------------
// Activity point recording
// ---------------------------------------------------------------------------

export async function recordActivityPoint(
  userId: string,
  signal: keyof typeof ACTIVITY_SIGNALS,
): Promise<void> {
  const now = Date.now()
  const member = `${signal}:${now}`
  await redis.zadd(ACTIVITY_KEY(userId), now, member)
}

// ---------------------------------------------------------------------------
// Sub-signal calculators
// ---------------------------------------------------------------------------

export async function computeActivityScore(userId: string): Promise<number> {
  const members = await redis.zrangewithscores(ACTIVITY_KEY(userId), 0, -1)

  if (members.length === 0) return 0

  const now = Date.now()
  let total = 0

  for (let i = 0; i < members.length; i += 2) {
    const member = members[i] as string
    const score = Number(members[i + 1])

    const signalKey = member.split(':')[0] as keyof typeof ACTIVITY_SIGNALS
    const config = ACTIVITY_SIGNALS[signalKey]
    if (!config) continue

    const decayMs = config.decayDays * 24 * 60 * 60 * 1000
    if (now - score <= decayMs) {
      total += config.points
    }
  }

  return Math.min(100, total)
}

export async function computeKudosScore(
  prisma: PrismaClient,
  userId: string,
): Promise<number> {
  return getKudosScore(prisma, userId)
}

export async function computeResponseScore(
  prisma: PrismaClient,
  userId: string,
): Promise<number> {
  // Find all conversations the user participates in
  const participations = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true },
  })

  if (participations.length === 0) return 0

  const conversationIds = participations.map((p) => p.conversationId)

  // Messages sent TO the user (by others, in shared conversations)
  const receivedMessages = await prisma.message.findMany({
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: userId },
      deletedAt: null,
    },
    select: { id: true, conversationId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  if (receivedMessages.length === 0) return 0

  // Messages sent FROM the user
  const sentMessages = await prisma.message.findMany({
    where: {
      conversationId: { in: conversationIds },
      senderId: userId,
      deletedAt: null,
    },
    select: { conversationId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Build a lookup: conversationId -> sorted sent timestamps
  const sentByConversation = new Map<string, Date[]>()
  for (const msg of sentMessages) {
    const arr = sentByConversation.get(msg.conversationId) ?? []
    arr.push(msg.createdAt)
    sentByConversation.set(msg.conversationId, arr)
  }

  let replied = 0
  const responseTimes: number[] = []

  for (const received of receivedMessages) {
    const sentTimes = sentByConversation.get(received.conversationId)
    if (!sentTimes) continue

    // Find first reply after this received message
    const reply = sentTimes.find((t) => t > received.createdAt)
    if (reply) {
      replied++
      responseTimes.push(reply.getTime() - received.createdAt.getTime())
    }
  }

  const responseRate = replied / receivedMessages.length

  // Time-based score: faster average response = higher score (max 50)
  let timeScore = 0
  if (responseTimes.length > 0) {
    const avgMs =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    const avgHours = avgMs / (1000 * 60 * 60)
    // Under 1h → 50, under 6h → 35, under 24h → 20, under 72h → 10, else 0
    if (avgHours < 1) timeScore = 50
    else if (avgHours < 6) timeScore = 35
    else if (avgHours < 24) timeScore = 20
    else if (avgHours < 72) timeScore = 10
    else timeScore = 0
  }

  const rateScore = responseRate * 50
  return Math.min(100, Math.round(rateScore + timeScore))
}

export async function computeProfileQualityScore(
  prisma: PrismaClient,
  userId: string,
): Promise<number> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      bio: true,
      verified: true,
      updatedAt: true,
      photos: { select: { id: true } },
      prompts: { select: { id: true } },
    },
  })

  if (!profile) return 0

  let score = 0

  if (profile.bio && profile.bio.trim().length > 0) score += 20
  if (profile.photos.length >= 3) score += 30
  if (profile.verified) score += 20
  if (profile.prompts.length > 0) score += 15

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  if (profile.updatedAt > thirtyDaysAgo) score += 15

  return Math.min(100, score)
}

export async function computeCommunityScore(
  prisma: PrismaClient,
  userId: string,
): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [postCount, likeCount, attendanceCount, hostedCount] =
    await Promise.all([
      prisma.post.count({
        where: { authorId: userId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.feedInteraction.count({
        where: {
          userId,
          type: 'LIKE',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.eventAttendee.count({
        where: { userId, status: 'GOING' },
      }),
      prisma.event.count({
        where: { createdById: userId },
      }),
    ])

  const postsScore = Math.min(25, postCount * 5)
  const likesScore = Math.min(15, likeCount * 2)
  const attendScore = Math.min(30, attendanceCount * 10)
  const hostedScore = Math.min(30, hostedCount * 20)

  return Math.min(100, postsScore + likesScore + attendScore + hostedScore)
}

export async function computeSafetyScore(
  prisma: PrismaClient,
  userId: string,
): Promise<number> {
  const [user, pendingReports, confirmedReports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { warningCount: true },
    }),
    prisma.report.count({
      where: { targetId: userId, status: 'PENDING' },
    }),
    prisma.report.count({
      where: { targetId: userId, status: 'REVIEWED' },
    }),
  ])

  if (!user) return 0

  let score = 100
  score -= pendingReports * 10
  score -= confirmedReports * 20
  score -= user.warningCount * 15

  return Math.max(0, score)
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export async function computeTotalScore(
  prisma: PrismaClient,
  userId: string,
): Promise<TrustScoreBreakdown> {
  const [
    kudosScore,
    activityScore,
    responseScore,
    profileQualityScore,
    communityScore,
    safetyScore,
  ] = await Promise.all([
    computeKudosScore(prisma, userId),
    computeActivityScore(userId),
    computeResponseScore(prisma, userId),
    computeProfileQualityScore(prisma, userId),
    computeCommunityScore(prisma, userId),
    computeSafetyScore(prisma, userId),
  ])

  const totalScore = Math.min(
    100,
    Math.round(
      kudosScore * TRUST_WEIGHTS.KUDOS +
        communityScore * TRUST_WEIGHTS.COMMUNITY +
        activityScore * TRUST_WEIGHTS.ACTIVITY +
        responseScore * TRUST_WEIGHTS.RESPONSE +
        profileQualityScore * TRUST_WEIGHTS.PROFILE_QUALITY +
        safetyScore * TRUST_WEIGHTS.SAFETY,
    ),
  )

  return {
    kudosScore,
    activityScore,
    responseScore,
    profileQualityScore,
    communityScore,
    safetyScore,
    totalScore,
  }
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export async function syncScoreToPostgres(
  prisma: PrismaClient,
  userId: string,
  scores: TrustScoreBreakdown,
): Promise<void> {
  await prisma.profileTrustScore.upsert({
    where: { userId },
    create: {
      userId,
      kudosScore: scores.kudosScore,
      activityScore: scores.activityScore,
      responseScore: scores.responseScore,
      profileQualityScore: scores.profileQualityScore,
      communityScore: scores.communityScore,
      safetyScore: scores.safetyScore,
      totalScore: scores.totalScore,
    },
    update: {
      kudosScore: scores.kudosScore,
      activityScore: scores.activityScore,
      responseScore: scores.responseScore,
      profileQualityScore: scores.profileQualityScore,
      communityScore: scores.communityScore,
      safetyScore: scores.safetyScore,
      totalScore: scores.totalScore,
    },
  })
}

export async function cacheScoreToRedis(
  userId: string,
  scores: TrustScoreBreakdown,
): Promise<void> {
  const key = SCORE_KEY(userId)
  await redis.hset(key, {
    kudosScore: scores.kudosScore,
    activityScore: scores.activityScore,
    responseScore: scores.responseScore,
    profileQualityScore: scores.profileQualityScore,
    communityScore: scores.communityScore,
    safetyScore: scores.safetyScore,
    totalScore: scores.totalScore,
  })
  // Expire after 2 hours — scores are refreshed hourly
  await redis.expire(key, 7200)
}

export async function getTrustScoreFromRedis(userId: string): Promise<number> {
  const raw = await redis.hget(SCORE_KEY(userId), 'totalScore')
  if (raw === null) return 0
  const parsed = parseInt(raw, 10)
  return isNaN(parsed) ? 0 : parsed
}

// ---------------------------------------------------------------------------
// Hourly cron: refresh all active users
// ---------------------------------------------------------------------------

export async function refreshAllTrustScores(
  prisma: PrismaClient,
): Promise<void> {
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000

  // Collect user IDs that have had activity in the last 24 hours
  // We scan redis for activity keys and check recency via the sorted set max score
  const activeUserIds = new Set<string>()

  let cursor = '0'
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      'trust:activity:*',
      'COUNT',
      '200',
    )
    cursor = nextCursor

    for (const key of keys) {
      // Get the most recent activity timestamp (highest score in the sorted set)
      const result = await redis.zrevrangebyscore(
        key,
        '+inf',
        twentyFourHoursAgo,
        'LIMIT',
        0,
        1,
      )
      if (result.length > 0) {
        const userId = key.replace('trust:activity:', '')
        activeUserIds.add(userId)
      }
    }
  } while (cursor !== '0')

  // Also pick up users with recently changed signals (trust scores updated in last 25h)
  const recentlyUpdated = await prisma.profileTrustScore.findMany({
    where: {
      updatedAt: {
        gte: new Date(Date.now() - 25 * 60 * 60 * 1000),
      },
    },
    select: { userId: true },
  })

  for (const { userId } of recentlyUpdated) {
    activeUserIds.add(userId)
  }

  // Refresh scores in bounded concurrency (batches of 20)
  const userList = Array.from(activeUserIds)
  const BATCH_SIZE = 20

  for (let i = 0; i < userList.length; i += BATCH_SIZE) {
    const batch = userList.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (userId) => {
        const scores = await computeTotalScore(prisma, userId)
        await Promise.all([
          syncScoreToPostgres(prisma, userId, scores),
          cacheScoreToRedis(userId, scores),
        ])
      }),
    )
  }
}
