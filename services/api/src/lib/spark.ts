import type { PrismaClient } from '@prisma/client'
import { redis } from './redis.js'

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------
const BALANCE_KEY = (userId: string) => `sparks:balance:${userId}`
const MILESTONES_KEY = (userId: string) => `sparks:milestones:${userId}`
const WEEKLY_KEY = (userId: string) => `sparks:weekly:${userId}`
const WEEKLY_TTL_SECONDS = 7 * 24 * 60 * 60

// ---------------------------------------------------------------------------
// Core operations
// ---------------------------------------------------------------------------

export async function getSparkBalance(
  prisma: PrismaClient,
  userId: string,
): Promise<number> {
  const cached = await redis.get(BALANCE_KEY(userId))
  if (cached !== null) {
    return parseInt(cached, 10)
  }

  const record = await prisma.profileTrustScore.findUnique({
    where: { userId },
    select: { sparksBalance: true },
  })

  const balance = record?.sparksBalance ?? 0
  await redis.set(BALANCE_KEY(userId), balance)
  return balance
}

export async function sendSpark(
  prisma: PrismaClient,
  senderId: string,
  recipientId: string,
): Promise<{ success: true; newBalance: number } | { success: false; reason: string }> {
  const balance = await getSparkBalance(prisma, senderId)
  if (balance <= 0) {
    return { success: false, reason: 'insufficient_balance' }
  }

  try {
    await prisma.spark.create({
      data: { senderId, recipientId },
    })
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return { success: false, reason: 'already_sparked' }
    }
    throw err
  }

  await prisma.profileTrustScore.update({
    where: { userId: senderId },
    data: { sparksBalance: { decrement: 1 } },
  })

  const newBalance = await redis.decrby(BALANCE_KEY(senderId), 1)
  return { success: true, newBalance }
}

export async function getSparksReceived(
  prisma: PrismaClient,
  userId: string,
): Promise<Array<{ senderId: string; createdAt: Date }>> {
  return prisma.spark.findMany({
    where: { recipientId: userId },
    select: { senderId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function awardSparks(
  prisma: PrismaClient,
  userId: string,
  amount: number,
  reason: string,
): Promise<void> {
  const alreadyAwarded = await redis.sismember(MILESTONES_KEY(userId), reason)
  if (alreadyAwarded === 1) {
    return
  }

  await prisma.profileTrustScore.upsert({
    where: { userId },
    update: { sparksBalance: { increment: amount } },
    create: { userId, sparksBalance: amount },
  })

  await redis.incrby(BALANCE_KEY(userId), amount)
  await redis.sadd(MILESTONES_KEY(userId), reason)
}

// ---------------------------------------------------------------------------
// Weekly allocation
// ---------------------------------------------------------------------------

export async function weeklySparkAllocation(prisma: PrismaClient): Promise<number> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const activeUsers = await prisma.profileTrustScore.findMany({
    where: {
      user: {
        updatedAt: { gte: since },
      },
    },
    select: { userId: true },
  })

  let count = 0

  for (const { userId } of activeUsers) {
    const alreadyAllocated = await redis.exists(WEEKLY_KEY(userId))
    if (alreadyAllocated === 1) {
      continue
    }

    await prisma.profileTrustScore.update({
      where: { userId },
      data: { sparksBalance: { increment: 1 } },
    })

    await redis.incrby(BALANCE_KEY(userId), 1)
    await redis.set(WEEKLY_KEY(userId), '1', 'EX', WEEKLY_TTL_SECONDS)
    count++
  }

  return count
}

// ---------------------------------------------------------------------------
// Milestone handlers
// ---------------------------------------------------------------------------

export async function awardStreakSparks(
  prisma: PrismaClient,
  userId: string,
  streakDays: number,
): Promise<void> {
  if (streakDays === 7) {
    await awardSparks(prisma, userId, 1, 'streak:7')
  } else if (streakDays === 30) {
    await awardSparks(prisma, userId, 3, 'streak:30')
  }
}

export async function awardKudosMilestoneSparks(
  prisma: PrismaClient,
  userId: string,
  kudosCount: number,
): Promise<void> {
  if (kudosCount === 10) {
    await awardSparks(prisma, userId, 2, 'kudos:10')
  } else if (kudosCount === 50) {
    await awardSparks(prisma, userId, 5, 'kudos:50')
  }
}

export async function awardEventSparks(
  prisma: PrismaClient,
  userId: string,
  type: 'host' | 'attend',
): Promise<void> {
  const timestamp = Date.now()
  if (type === 'host') {
    await awardSparks(prisma, userId, 2, `event:host:${timestamp}`)
  } else {
    await awardSparks(prisma, userId, 1, `event:attend:${timestamp}`)
  }
}

export async function awardReferralSparks(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  const timestamp = Date.now()
  await awardSparks(prisma, userId, 3, `referral:${timestamp}`)
}
