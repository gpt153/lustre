# Epic: wave-1c-seen-list

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — depends on 1b)

## Description

Add Redis-backed seen-list caching for fast lookup during discovery stack generation. The DB SeenProfile table is the source of truth; Redis is a fast cache layer.

## Acceptance Criteria

1. File `services/api/src/lib/seen-list.ts` exists and exports: `addToSeenList(redis, userId, targetId)`, `isInSeenList(redis, userId, targetId)`, `getSeenList(redis, userId)`, `warmSeenListFromDb(prisma, redis, userId)`
2. Redis key pattern: `seen:{userId}` as a Redis SET
3. TTL of 30 days (2592000 seconds) set/refreshed on every `addToSeenList` call
4. `warmSeenListFromDb` loads all SeenProfile records for a user into Redis (called on cache miss)
5. `match.getDiscoveryStack` in match-router.ts is updated to check Redis seen-list first (with DB fallback), making stack generation faster
6. `match.swipe` in match-router.ts calls `addToSeenList` after creating the SeenProfile DB record
7. All functions handle Redis errors gracefully (log + fallback to DB query, never throw)

## File Paths

- `services/api/src/lib/seen-list.ts` (new)
- `services/api/src/trpc/match-router.ts` (edit)
