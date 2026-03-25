import type Redis from 'ioredis'
import type { PrismaClient } from '@prisma/client'

const SEEN_LIST_KEY_PREFIX = 'seen:'
const SEEN_LIST_TTL_SECONDS = 2592000 // 30 days

export async function addToSeenList(
  redis: Redis,
  userId: string,
  targetId: string
): Promise<void> {
  try {
    const key = `${SEEN_LIST_KEY_PREFIX}${userId}`
    await redis.sadd(key, targetId)
    await redis.expire(key, SEEN_LIST_TTL_SECONDS)
  } catch (error) {
    console.error('Error adding to seen list in Redis:', error)
  }
}

export async function isInSeenList(
  redis: Redis,
  userId: string,
  targetId: string
): Promise<boolean> {
  try {
    const key = `${SEEN_LIST_KEY_PREFIX}${userId}`
    const result = await redis.sismember(key, targetId)
    return result === 1
  } catch (error) {
    console.error('Error checking seen list in Redis:', error)
    return false
  }
}

export async function getSeenList(
  redis: Redis,
  userId: string
): Promise<string[]> {
  try {
    const key = `${SEEN_LIST_KEY_PREFIX}${userId}`
    const result = await redis.smembers(key)
    return result
  } catch (error) {
    console.error('Error getting seen list from Redis:', error)
    return []
  }
}

export async function warmSeenListFromDb(
  prisma: PrismaClient,
  redis: Redis,
  userId: string
): Promise<void> {
  try {
    const seenProfiles = await prisma.seenProfile.findMany({
      where: { userId },
      select: { targetId: true },
    })

    const key = `${SEEN_LIST_KEY_PREFIX}${userId}`
    const targetIds = seenProfiles.map(sp => sp.targetId)

    if (targetIds.length > 0) {
      await redis.sadd(key, ...targetIds)
    }

    await redis.expire(key, SEEN_LIST_TTL_SECONDS)
  } catch (error) {
    console.error('Error warming seen list from database:', error)
  }
}
