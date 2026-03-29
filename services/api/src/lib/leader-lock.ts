import { redis } from './redis.js'
import { randomUUID } from 'crypto'

const REPLICA_ID = randomUUID()

/**
 * Execute fn only if this replica acquires the Redis lock.
 * Uses SET NX EX for atomic lock acquisition.
 * Lock is released after fn completes or expires via TTL on crash.
 */
export async function withLeaderLock(
  lockKey: string,
  ttlSeconds: number,
  fn: () => Promise<void>,
): Promise<boolean> {
  const acquired = await redis.set(lockKey, REPLICA_ID, 'EX', ttlSeconds, 'NX')
  if (acquired !== 'OK') return false

  try {
    await fn()
  } finally {
    // Only release if we still own it (check-and-delete)
    const currentOwner = await redis.get(lockKey)
    if (currentOwner === REPLICA_ID) {
      await redis.del(lockKey)
    }
  }
  return true
}
