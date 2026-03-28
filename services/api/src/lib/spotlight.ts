import type { PrismaClient } from '@prisma/client'
import { redis } from './redis.js'

const SPOTLIGHT_DURATION_MS = 30 * 60 * 1000
const SPOTLIGHT_DURATION_SECONDS = 30 * 60
const ACTIVE_KEY = (userId: string) => `spotlight:active:${userId}`
const MILESTONES_KEY = (userId: string) => `spotlight:milestones:${userId}`

export async function activateSpotlight(
  prisma: PrismaClient,
  userId: string,
): Promise<
  | { success: true; expiresAt: Date; remainingSeconds: number }
  | { success: false; reason: string }
> {
  const credits = await getSpotlightCredits(prisma, userId)
  if (credits === 0) {
    return { success: false, reason: 'no spotlight credits' }
  }

  const alreadyActive = await redis.exists(ACTIVE_KEY(userId))
  if (alreadyActive === 1) {
    return { success: false, reason: 'spotlight already active' }
  }

  const expiresAt = new Date(Date.now() + SPOTLIGHT_DURATION_MS)
  const spotlight = await prisma.spotlight.create({
    data: { userId, startsAt: new Date(), expiresAt },
  })

  await redis.set(ACTIVE_KEY(userId), spotlight.id, 'EX', SPOTLIGHT_DURATION_SECONDS)

  await prisma.profileTrustScore.update({
    where: { userId },
    data: { spotlightCredits: { decrement: 1 } },
  })

  return { success: true, expiresAt, remainingSeconds: SPOTLIGHT_DURATION_SECONDS }
}

export async function getSpotlightStatus(
  userId: string,
): Promise<{ active: boolean; remainingSeconds: number }> {
  const ttl = await redis.ttl(ACTIVE_KEY(userId))
  if (ttl > 0) {
    return { active: true, remainingSeconds: ttl }
  }
  return { active: false, remainingSeconds: 0 }
}

export async function isSpotlightActive(userId: string): Promise<boolean> {
  const exists = await redis.exists(ACTIVE_KEY(userId))
  return exists === 1
}

export async function getSpotlightCredits(
  prisma: PrismaClient,
  userId: string,
): Promise<number> {
  const record = await prisma.profileTrustScore.findUnique({
    where: { userId },
    select: { spotlightCredits: true },
  })
  return record?.spotlightCredits ?? 0
}

export async function awardSpotlightCredit(
  prisma: PrismaClient,
  userId: string,
  reason: string,
): Promise<void> {
  const alreadyAwarded = await redis.sismember(MILESTONES_KEY(userId), reason)
  if (alreadyAwarded === 1) {
    return
  }

  await prisma.profileTrustScore.upsert({
    where: { userId },
    update: { spotlightCredits: { increment: 1 } },
    create: { userId, spotlightCredits: 1 },
  })

  await redis.sadd(MILESTONES_KEY(userId), reason)
}

export async function awardStreakSpotlight(
  prisma: PrismaClient,
  userId: string,
  streakDays: number,
): Promise<void> {
  if (streakDays === 14) {
    await awardSpotlightCredit(prisma, userId, 'streak:14')
  }
}

export async function awardKudosMilestoneSpotlight(
  prisma: PrismaClient,
  userId: string,
  kudosCount: number,
): Promise<void> {
  if (kudosCount === 50) {
    await awardSpotlightCredit(prisma, userId, 'kudos:50')
  }
}

export async function awardEventHostSpotlight(
  prisma: PrismaClient,
  userId: string,
  attendeeCount: number,
): Promise<void> {
  if (attendeeCount >= 10) {
    await awardSpotlightCredit(prisma, userId, `event_host:10plus:${Date.now()}`)
  }
}
