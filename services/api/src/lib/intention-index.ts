import { redis } from './redis.js'

function indexKey(seeking: string, gender: string): string {
  return `intentions:seeking:${seeking}:gender:${gender}`
}

export async function indexIntention(intention: {
  id: string
  seeking: string
  genderPreferences: string[]
  expiresAt: Date
  status: string
}): Promise<void> {
  if (intention.status !== 'ACTIVE') return

  const score = intention.expiresAt.getTime()
  const pipeline = redis.pipeline()

  for (const gender of intention.genderPreferences) {
    pipeline.zadd(indexKey(intention.seeking, gender), score, intention.id)
  }

  await pipeline.exec()
}

export async function removeFromIndex(intention: {
  id: string
  seeking: string
  genderPreferences: string[]
}): Promise<void> {
  const pipeline = redis.pipeline()

  for (const gender of intention.genderPreferences) {
    pipeline.zrem(indexKey(intention.seeking, gender), intention.id)
  }

  await pipeline.exec()
}

export async function updateIntentionIndex(
  oldIntention: { id: string; seeking: string; genderPreferences: string[] },
  newIntention: { id: string; seeking: string; genderPreferences: string[]; expiresAt: Date; status: string }
): Promise<void> {
  await removeFromIndex(oldIntention)
  await indexIntention(newIntention)
}

export async function getMatchingIntentionIds(
  seeking: string,
  gender: string
): Promise<string[]> {
  const key = indexKey(seeking, gender)
  const now = Date.now()
  return redis.zrangebyscore(key, now, '+inf')
}

export async function cleanupExpiredFromIndex(): Promise<void> {
  const now = Date.now()

  // Collect all known index keys via scan
  const keys: string[] = []
  let cursor = '0'

  do {
    const [nextCursor, batch] = await redis.scan(
      cursor,
      'MATCH',
      'intentions:seeking:*:gender:*',
      'COUNT',
      100
    )
    cursor = nextCursor
    keys.push(...batch)
  } while (cursor !== '0')

  if (keys.length === 0) return

  const pipeline = redis.pipeline()
  for (const key of keys) {
    pipeline.zremrangebyscore(key, '-inf', now - 1)
  }

  await pipeline.exec()
}
