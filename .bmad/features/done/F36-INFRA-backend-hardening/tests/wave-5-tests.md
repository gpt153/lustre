# Test Spec: Wave 5 — Background Job Safety + Redis HA + Audit Trail

## Scope

Verify that background jobs execute on exactly one replica (leader election), that Redis Sentinel config is prepared, and that all admin mutations create audit log records.

---

## T5.1: Leader Election for Background Jobs

**Tool:** Vitest + Redis test instance
**File:** `services/api/src/__tests__/leader-lock.test.ts`

### Unit Tests

1. **withLeaderLock — acquires lock** — Given no existing lock, when `withLeaderLock('job:test', 60, fn)` is called, then `SET job:test {id} NX EX 60` succeeds and `fn` is called
2. **withLeaderLock — lock already held** — Given an existing lock held by another replica, when `withLeaderLock('job:test', 60, fn)` is called, then `fn` is NOT called and the function returns silently
3. **withLeaderLock — releases on completion** — Given a lock is acquired, when `fn` completes successfully, then `DEL job:test` is called
4. **withLeaderLock — TTL expires on crash** — Given a lock is acquired and the process crashes (fn throws), then the lock expires after TTL (not held forever)

### Integration Tests

5. **Concurrent replicas — single execution** — Start two `withLeaderLock` calls for `job:autoConfirm` simultaneously. Assert `fn` is called exactly once across both
6. **autoConfirmOrders uses leader lock** — Given the `setInterval` for `autoConfirmOrders`, when it fires, then it wraps execution in `withLeaderLock('job:autoConfirm:lock', 3600, ...)`
7. **refreshAllTrustScores uses leader lock** — Given the `setInterval` for `refreshAllTrustScores`, when it fires, then it wraps execution in `withLeaderLock('job:trustScore:lock', 3600, ...)`

---

## T5.2: Redis Sentinel Prep

**Tool:** Manual verification (no automated tests — config only)

### Manual Verification

- [ ] `infrastructure/helm/redis/values.yaml` has `sentinel.enabled: false` with commented Sentinel config block
- [ ] When `sentinel.enabled: true`, the Helm template generates Sentinel StatefulSet and Service
- [ ] `services/api/src/lib/redis.ts` detects `REDIS_SENTINEL_HOSTS` env var and creates Sentinel-aware ioredis client
- [ ] Without `REDIS_SENTINEL_HOSTS`, Redis client connects directly as before (backward compatible)

---

## T5.3: Audit Trail

**Tool:** Vitest + Prisma test client
**File:** `services/api/src/__tests__/audit-log.test.ts`

### Unit Tests

1. **AuditLog model exists** — Given the Prisma client, when `prisma.auditLog.create(...)` is called, then it creates a record with `id`, `adminId`, `action`, `targetType`, `targetId`, `metadata`, `createdAt`
2. **suspendUser creates audit log** — Given an admin calls `admin.suspendUser({ userId, reason, days })`, then an `AuditLog` is created with `action: 'SUSPEND_USER'`, `targetType: 'USER'`, `targetId: userId`, `metadata: { reason, days, previousStatus, newStatus }`
3. **banUser creates audit log** — Given an admin calls `admin.banUser({ userId, reason })`, then an `AuditLog` is created with `action: 'BAN_USER'`
4. **resolveReport creates audit log** — Given an admin calls `report.resolve({ reportId, resolution })`, then an `AuditLog` is created with `action: 'RESOLVE_REPORT'`, `targetType: 'REPORT'`
5. **takeAction creates audit log** — Given an admin calls `report.takeAction(...)`, then an `AuditLog` is created with appropriate action and metadata

### Integration Tests

6. **admin.getAuditLog — paginated** — Create 25 audit logs. Call `admin.getAuditLog({ limit: 10, cursor: null })`. Assert 10 results returned with a next cursor
7. **admin.getAuditLog — filter by action** — Create audit logs with different actions. Call with `{ action: 'BAN_USER' }`. Assert only ban actions returned
8. **admin.getAuditLog — filter by date range** — Create audit logs across different dates. Filter by date range. Assert correct subset returned
9. **Non-admin cannot query audit log** — Given a regular user, when calling `admin.getAuditLog`, then it throws FORBIDDEN

### Manual Verification

- [ ] Open admin dashboard, ban a user, verify AuditLog record appears in Prisma Studio
- [ ] Query audit log via admin tRPC — verify metadata includes before/after state
- [ ] Verify all admin mutations in `admin-router.ts` and `report-router.ts` create audit records
