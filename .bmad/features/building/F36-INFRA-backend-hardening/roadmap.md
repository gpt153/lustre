# Roadmap: F36-INFRA-backend-hardening

**Status:** IN_PROGRESS
**Created:** 2026-03-29
**Waves:** 6
**Total epics:** 6
**Estimated duration:** 4-5 weeks

---

## Completed: Domain-Based Development

All app-facing URLs migrated from localhost to real domains via Cloudflare Tunnel. CORS is env-driven via `CORS_ORIGINS`. Infrastructure services remain localhost. This work is DONE and is not included in the waves below.

---

## Wave 1: Payment Security (week 1)

Validate payment webhook signatures and add idempotency keys to prevent forged and duplicate payments. This is the highest-priority security fix — MUST be done before launch.

**Status:** DONE (2026-03-29)

### Epics:
- wave-1-payment-security (sonnet) — VERIFIED — Webhook signature validation (HMAC-SHA256 with timingSafeEqual for Swish + Segpay) and idempotency keys on all payment-triggered token mutations. Database migration for unique constraints.

### Verification:
- `webhook-verify.ts` ✅ — HMAC-SHA256, constant-time comparison, dev-mode bypass
- `tokens.ts` ✅ — Idempotency via `findUnique` on `type_externalReference` composite key
- `segpay.ts` ✅ — `findUnique` on unique `segpayTxId`, passed as `externalReference`
- `swish-recurring.ts` ✅ — `callbackIdentifier` passed as `externalReference`
- `server.ts` ✅ — Raw body capture, signature verification on all 5 callback endpoints
- `schema.prisma` ✅ — `@@unique([type, externalReference])`, `@unique` on `segpayTxId`
- Migration SQL ✅ — Partial unique indexes with `WHERE IS NOT NULL`
- TypeScript ✅ — No new errors (pre-existing only: listing/order/seller/shop routers)

### Testgate Wave 1:
- [ ] All Swish callback endpoints reject unsigned requests with 401
- [ ] Segpay callback endpoint rejects invalid HMAC with 401
- [ ] Duplicate webhook delivery does not double-credit token balance
- [ ] `TokenTransaction` has unique constraint on `(type, externalReference)`
- [ ] `EventTicket` rejects duplicate `paymentReference`
- [ ] Integration tests pass with replayed/forged webhook payloads
- [ ] `pnpm build` succeeds from monorepo root

---

## Wave 2: Graceful Shutdown + Zod Validation (week 2)

Add ordered shutdown handling and runtime validation on all REST endpoints. Prevents data corruption during deploys and invalid payload processing.

**Status:** DONE (2026-03-29)

### Epics:
- wave-2-shutdown-validation (haiku) — VERIFIED — SIGTERM/SIGINT handler with ordered drain (Fastify → NATS → Redis → Prisma), 30s force-exit safety net, Zod schemas on all REST callback + upload endpoints.

### Verification:
- Graceful shutdown ✅ — `isShuttingDown` guard, ordered drain, 30s force-exit with `.unref()`, registered after `server.listen()`
- Zod validation ✅ — All 4 callback endpoints + 2 upload endpoints validated, structured 400 errors
- `rest-schemas.ts` ✅ — Clean schemas with `.passthrough()` on webhooks, UUID on queries
- TypeScript ✅ — No new errors

### Testgate Wave 2:
- [ ] SIGTERM triggers ordered shutdown (Fastify close → NATS drain → Redis quit → Prisma disconnect)
- [ ] In-flight requests complete before process exits (30s timeout)
- [ ] All REST endpoints return 400 for invalid payloads (not 500)
- [ ] Zod schemas exist for all REST endpoint request bodies
- [ ] SIGINT works for local dev shutdown
- [ ] `pnpm build` succeeds from monorepo root

---

## Wave 3: Web Auth + Rate Limiting (week 2-3)

Migrate web authentication from localStorage JWT to HttpOnly cookies. Add rate limiting on upload and callback endpoints.

**Status:** NOT STARTED

### Epics:
- wave-3-web-auth-rate-limit (sonnet) — HttpOnly cookie auth for web clients, migration path from localStorage, `@fastify/rate-limit` on REST endpoints with Redis backing.

### Testgate Wave 3:
- [ ] Web login sets HttpOnly Secure SameSite=Lax cookie
- [ ] tRPC context reads auth from cookie (web) OR Bearer header (mobile)
- [ ] localStorage migration endpoint works (sets cookie, signals client to clear)
- [ ] Upload endpoints rate-limited per user (configurable, e.g. 10/min)
- [ ] Callback endpoints rate-limited per IP (configurable, e.g. 30/min)
- [ ] Mobile auth unchanged (SecureStore + Bearer)
- [ ] `pnpm build` succeeds from monorepo root

---

## Wave 4: Durable NATS Consumers (week 3)

Replace fire-and-forget async calls with NATS JetStream durable consumers. Add dead-letter queue and conservative fallback for classification failures.

**Status:** NOT STARTED

### Epics:
- wave-4-durable-consumers (sonnet) — Create JetStream streams and durable consumers for media classification and search indexing. Exponential backoff (5 retries). Dead-letter subject. Conservative fallback: `needs_review` flag on classification failure.

### Testgate Wave 4:
- [ ] `classifyAndTagMedia` publishes to NATS instead of direct call
- [ ] `classifyChatMedia` publishes to NATS instead of direct call
- [ ] `indexProfile` publishes to NATS instead of direct call
- [ ] Failed classification retries with exponential backoff (1s, 5s, 30s, 120s, 600s)
- [ ] After max retries, message lands in dead-letter subject
- [ ] Classification failure flags media as `needs_review`
- [ ] NATS reconnect uses `reconnectDelayHandler` with exponential backoff
- [ ] `pnpm build` succeeds from monorepo root

---

## Wave 5: Background Job Safety + Redis HA + Audit Trail (week 4)

Make background jobs cluster-safe, prepare Redis for HA, and add comprehensive audit logging.

**Status:** NOT STARTED

### Epics:
- wave-5-jobs-redis-audit (haiku) — Redis-based leader election for `autoConfirmOrders` and `refreshAllTrustScores`. Redis Sentinel config prep in Helm chart. `AuditLog` Prisma model for all admin mutations.

### Testgate Wave 5:
- [ ] Only one replica runs `autoConfirmOrders` at a time (verified with 2 instances)
- [ ] Only one replica runs `refreshAllTrustScores` at a time
- [ ] Redis Sentinel Helm values documented and ready to activate
- [ ] `AuditLog` model created in Prisma schema
- [ ] All admin mutations (ban, suspend, resolve, takeAction) create AuditLog records
- [ ] AuditLog queryable via admin tRPC endpoint
- [ ] `pnpm build` and `pnpm test` succeed from monorepo root

---

## Wave 6: API Versioning + Gatekeeper Sanitization (week 4-5)

Add client version enforcement middleware and sanitize Gatekeeper AI prompt inputs.

**Status:** NOT STARTED

### Epics:
- wave-6-versioning-sanitization (haiku) — `X-Client-Version` header middleware with minimum version check. Gatekeeper dealbreaker sanitization (structured parameters instead of string interpolation).

### Testgate Wave 6:
- [ ] API reads `X-Client-Version` header and enforces minimum version
- [ ] Clients below minimum version receive 426 Upgrade Required
- [ ] Gatekeeper dealbreakers are passed as structured JSON, not interpolated into prompt
- [ ] Prompt injection patterns in dealbreakers are stripped/escaped
- [ ] Version config is per-platform (web vs mobile can have different minimums)
- [ ] `pnpm build` and `pnpm test` succeed from monorepo root
