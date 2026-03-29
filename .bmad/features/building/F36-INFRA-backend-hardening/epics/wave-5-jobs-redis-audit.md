# Epic: wave-5-jobs-redis-audit

**Model:** haiku
**Wave:** 5

## Description

Make background jobs cluster-safe using Redis-based leader election, prepare Redis Sentinel configuration for production HA, and add a comprehensive audit trail for all admin mutations. The two existing `setInterval` jobs (`autoConfirmOrders` every hour, `refreshAllTrustScores` every hour) get a `withLeaderLock` wrapper that uses `SET NX EX` to ensure only one replica executes at a time. An `AuditLog` Prisma model captures all admin actions with full context.

## Acceptance Criteria

1. Given `autoConfirmOrders` running on 2+ API replicas, when the interval fires, then only the replica that acquires `SET job:autoConfirm:lock {replicaId} NX EX 3600` executes the job; other replicas skip silently
2. Given `refreshAllTrustScores` running on 2+ API replicas, when the interval fires, then the same `withLeaderLock` pattern ensures single execution
3. Given a `withLeaderLock(lockKey, ttlSeconds, fn)` utility in `services/api/src/lib/leader-lock.ts`, when called, then it acquires a Redis lock, executes `fn`, and releases the lock on completion (or lets TTL expire on crash)
4. Given `infrastructure/helm/redis/values.yaml`, when Sentinel configuration is added, then it includes `sentinel.enabled: false` (off by default), `sentinel.replicas: 3`, and `sentinel.quorum: 2` — ready to activate for production
5. Given `services/api/src/lib/redis.ts`, when `REDIS_SENTINEL_HOSTS` env var is set, then the client connects via Sentinel instead of direct connection
6. Given a new `AuditLog` Prisma model, then it has fields: `id`, `adminId`, `action` (string), `targetType` (enum: USER, REPORT, ORGANIZATION), `targetId`, `metadata` (Json), `createdAt`
7. Given admin mutations `suspendUser`, `banUser`, `resolveReport`, `takeAction` in `admin-router.ts` and `report-router.ts`, when called, then each creates an `AuditLog` record with the admin's userId, action name, target, and relevant metadata
8. Given a new `admin.getAuditLog` tRPC query, when called by an admin, then it returns paginated audit log entries with filters for action type, target, and date range
9. Given the Prisma migration for `AuditLog`, then `pnpm prisma migrate dev` succeeds
10. Given the `AuditLog` `metadata` field, when populated, then it includes before/after state for status changes (e.g., `{ previousStatus: 'ACTIVE', newStatus: 'BANNED', reason: '...' }`)

## File Paths

- `services/api/src/server.ts`
- `services/api/src/lib/redis.ts`
- `services/api/src/lib/leader-lock.ts`
- `services/api/src/trpc/admin-router.ts`
- `services/api/prisma/schema.prisma`
- `infrastructure/helm/redis/values.yaml`
