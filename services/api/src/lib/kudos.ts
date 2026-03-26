import { redis } from './redis.js'
import type { PrismaClient } from '@prisma/client'

const BADGE_CACHE_KEY = 'kudos:badges:catalog'
const BADGE_CACHE_TTL = 3600
const RATE_LIMIT_PREFIX = 'kudos:ratelimit:'
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 86400

export async function getCachedBadgeCatalog(prisma: PrismaClient) {
  const cached = await redis.get(BADGE_CACHE_KEY)
  if (cached) return JSON.parse(cached)

  const categories = await prisma.kudosBadgeCategory.findMany({
    include: { badges: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  await redis.setex(BADGE_CACHE_KEY, BADGE_CACHE_TTL, JSON.stringify(categories))
  return categories
}

export async function invalidateBadgeCache() {
  await redis.del(BADGE_CACHE_KEY)
}

export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `${RATE_LIMIT_PREFIX}${userId}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW)
  }
  const allowed = count <= RATE_LIMIT_MAX
  return { allowed, remaining: Math.max(0, RATE_LIMIT_MAX - count) }
}
