# ADR: Backend Hardening & Stability

## Status

Proposed

## Date

2026-03-29

## Context

Lustre is approaching production launch with a Fastify 5 API serving both web (Next.js) and mobile (Expo React Native) clients. The API handles real money (Swish, Segpay payments), sensitive user data (encrypted PII), and content moderation (Sightengine classification). Several security and stability gaps must be resolved before launch. This ADR documents the key architectural decisions.

## Decisions

### D1: Env-Driven CORS Over Hardcoded Origins

**Decision:** CORS allowed origins are configured via the `CORS_ORIGINS` environment variable (comma-separated), defaulting to `app.lovelustre.com, pay.lovelustre.com, admin.lovelustre.com`. This is already implemented.

**Rationale:**
- Different environments (dev, staging, production) need different origins
- Cloudflare Tunnel routing means dev uses real domains, not localhost
- The landing page (`lovelustre.com`) is a separate app on its own port and does NOT call the API — it must NOT be in the CORS list
- Hardcoded origins would require code changes for each environment
- Env vars are the standard k8s/Helm pattern for runtime configuration

**Alternatives considered:**
- Wildcard `*` CORS — rejected because it disables credential-based requests and is a security risk
- Hardcoded origin list with build-time flags — rejected because it requires rebuilding the image per environment
- Per-route CORS config — rejected as unnecessary complexity; all API routes serve the same clients

### D2: NATS Durable Consumers Over Fire-and-Forget

**Decision:** Replace all `.catch(() => {})` fire-and-forget async calls with NATS JetStream durable consumers that have exponential backoff retry (5 attempts, 1s/5s/30s/120s/600s) and dead-letter subjects.

**Rationale:**
- Current pattern: `classifyAndTagMedia(url).catch(() => {})` — if Sightengine is down, sexually explicit content passes through unfiltered. This is a safety-critical failure mode.
- Current pattern: `indexProfile(profile).catch(() => {})` — search index becomes stale, users don't appear in discovery.
- NATS JetStream is already deployed (`infrastructure/helm/nats/`) and used for chat messages (`chat.message.new`), kudos (`match.conversation.archived`), and trust score events.
- Durable consumers survive server restarts — messages are not lost.
- Dead-letter queue enables manual inspection of permanently failed messages.
- Conservative fallback: if classification fails after all retries, flag as `needs_review` rather than allowing through.

**Pattern:**
```
Publisher: server.ts publishes to `media.classify` subject after upload
Consumer: media-classifier-consumer.ts subscribes as durable consumer "media-classifier"
Retry: JetStream AckPolicy with maxDeliver=5, backoff=[1s,5s,30s,120s,600s]
DLQ: On final failure, publish to `media.classify.dlq` and flag media as needs_review
```

**Affected fire-and-forget calls:**
1. `classifyAndTagMedia(url).catch(() => {})` in `server.ts` (photo/post upload)
2. `classifyChatMedia(messageId, url, convId).catch(() => {})` in chat consumer
3. `indexProfile(profile).catch(() => {})` in profile router

**Alternatives considered:**
- BullMQ (Redis-based job queue) — rejected because NATS JetStream is already in the stack and adding another queue system increases operational complexity
- pg-boss (PostgreSQL-based) — rejected for same reason; NATS is purpose-built for this
- Keep fire-and-forget but add health checks — rejected because it doesn't solve the "messages lost during downtime" problem

### D3: HttpOnly Cookies for Web Auth Over localStorage

**Decision:** Migrate web client auth from `localStorage.getItem('lustre-auth')` to HttpOnly, Secure, SameSite=Lax cookies. Mobile continues using Expo SecureStore + Bearer header.

**Rationale:**
- localStorage is accessible to any JavaScript running on the page — a single XSS vulnerability (malicious ad, compromised CDN, browser extension) can steal the JWT
- HttpOnly cookies cannot be read by JavaScript — they're only sent by the browser automatically
- SameSite=Lax prevents CSRF for state-changing requests while allowing top-level navigations
- The API already handles both cookie and header auth in the tRPC context (it reads from `Authorization` header) — adding cookie reading is a small change
- Expo SecureStore is already secure (hardware-backed keychain on iOS, EncryptedSharedPreferences on Android) — no change needed for mobile

**Migration strategy:**
1. API sets `Set-Cookie` on login/refresh responses when `User-Agent` indicates web browser
2. tRPC context checks cookie first, falls back to Authorization header
3. Web client detects existing localStorage token, calls a migration endpoint that sets the cookie, then clears localStorage
4. After migration period (2 weeks), remove localStorage fallback

**Cookie configuration:**
- `HttpOnly: true` — not accessible via `document.cookie`
- `Secure: true` — only sent over HTTPS
- `SameSite: Lax` — sent on top-level navigations (links) but not on cross-origin subrequests
- `Domain: .lovelustre.com` — shared across `app.lovelustre.com` and `pay.lovelustre.com`
- `Path: /` — available for all API routes
- `Max-Age: 2592000` — 30 days (matches refresh token expiry)

**Alternatives considered:**
- Session-based auth (server-side sessions in Redis) — rejected because it adds state to the API and complicates horizontal scaling; JWT is already working well
- Keep localStorage but add CSP headers — rejected because CSP is defense-in-depth, not a replacement for proper cookie security; also, CSP can be bypassed in some scenarios

### D4: Idempotency Keys Pattern — Unique Constraint + Upsert

**Decision:** Add a unique constraint on `(type, externalReference)` to `TokenTransaction` and use Prisma `upsert` (or `createMany` with `skipDuplicates`) for all payment-triggered token credits. Each payment callback carries a reference that serves as the natural idempotency key.

**Rationale:**
- Payment providers (Swish, Segpay) can deliver webhooks multiple times (network retry, provider retry, manual redelivery)
- Without idempotency, each delivery creates a new `TokenTransaction` and credits the user balance again
- Natural idempotency keys already exist: Swish `paymentReference`, Segpay `transactionId`, EventTicket `ticketId`, marketplace Order `orderId`
- Database-level unique constraint is the strongest guarantee — it works even if application-level checks have race conditions
- Upsert pattern: `prisma.tokenTransaction.upsert({ where: { type_externalReference: { type, externalReference } }, create: { ... }, update: {} })` — the `update: {}` is a no-op, making duplicates harmless

**Affected models and their idempotency keys:**
| Model | Idempotency Key | Source |
|-------|-----------------|--------|
| TokenTransaction | `type` + `externalReference` | Swish paymentReference, Segpay transactionId |
| EventTicket | `paymentReference` | Swish paymentReference |
| SwishRecurringAgreement | `agreementId` + payment reference | Swish recurring callback |
| SegpayTransaction | `transactionId` | Segpay callback |
| marketplace Order | `orderId` + `status` | Swish marketplace callback |

**Alternatives considered:**
- Application-level idempotency cache (Redis) — rejected as primary mechanism because Redis can lose data on restart; used as supplementary fast-path check only
- Separate IdempotencyKey table — rejected because the natural keys already exist on the domain models; adding another table is unnecessary indirection
- Client-generated idempotency keys — not applicable because webhooks come from payment providers, not our clients

### D5: Graceful Shutdown — Ordered Drain Sequence

**Decision:** Implement a SIGTERM handler that performs an ordered shutdown: (1) stop accepting new connections, (2) drain in-flight HTTP requests (30s timeout), (3) unsubscribe NATS consumers, (4) close Redis connections, (5) disconnect Prisma, (6) exit.

**Rationale:**
- Kubernetes sends SIGTERM before killing a pod (default 30s `terminationGracePeriodSeconds`)
- Without handling SIGTERM, in-flight requests (especially payment webhooks) are killed mid-execution
- NATS consumers must unsubscribe to allow rebalancing to other replicas
- Redis and Prisma connection pools must close cleanly to avoid connection leaks
- Fastify has built-in `server.close()` that stops accepting new connections and waits for in-flight requests

**Shutdown sequence:**
```
SIGTERM received
  → log "shutdown initiated"
  → fastify.close() (stops new connections, drains in-flight, 30s timeout)
  → natsConnection.drain() (flushes pending messages, unsubscribes consumers)
  → redis.quit() (sends QUIT command, waits for pending replies)
  → prisma.$disconnect()
  → process.exit(0)
```

**Alternatives considered:**
- Immediate `process.exit()` — rejected because it kills in-flight requests
- Only handle SIGTERM, ignore SIGINT — rejected; handle both (SIGINT for local dev, SIGTERM for k8s)
- Custom drain logic — rejected; Fastify's built-in `server.close()` handles HTTP drain correctly

### D6: Webhook Signature Validation — HMAC-SHA256

**Decision:** Validate all payment webhooks using HMAC-SHA256 signature verification. Swish provides a callback signature via certificate-based mTLS — we verify the client certificate. Segpay provides a shared secret for HMAC validation.

**Rationale:**
- Current state: all callback endpoints accept any POST with the right shape — an attacker can credit themselves unlimited tokens
- Swish Handel API uses mTLS — the callback is authenticated by the client certificate presented during the TLS handshake. We must verify that the certificate matches Swish's known CA.
- Segpay uses a shared secret (`SEGPAY_WEBHOOK_SECRET`) to compute an HMAC signature included in a header
- Both are standard patterns for payment webhook security

**Implementation:**
- Swish: Verify callback certificate against Swish CA bundle (already have `SWISH_CERT_PATH`)
- Segpay: Verify `X-Segpay-Signature` header using `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')`
- All endpoints: reject unsigned/invalid requests with 401 before any business logic

**Alternatives considered:**
- IP allowlisting — rejected as primary mechanism (IPs can change, NAT complicates things); acceptable as supplementary defense
- Webhook token in URL path — rejected because URL tokens can leak in logs and referer headers

### D7: REST Validation — Zod Schemas with Fastify Integration

**Decision:** Add Zod schemas for all REST endpoint request bodies and use `schema.parse(request.body)` at the top of each handler. Validation errors return 400 with structured error details.

**Rationale:**
- tRPC endpoints already validate via Zod (built into tRPC input schemas)
- REST endpoints use `request.body as SwishCallbackPayload` — a type assertion that provides zero runtime safety
- Invalid payloads can cause runtime errors deep in business logic, producing 500s instead of clear 400s
- Zod is already a dependency (used extensively in tRPC routers)
- Consistent validation across all endpoints reduces the attack surface

**Alternatives considered:**
- Fastify JSON Schema validation (built-in via Ajv) — rejected because the codebase already uses Zod everywhere and mixing two validation libraries adds confusion
- `@fastify/type-provider-zod` — considered but adds unnecessary indirection for the small number of REST endpoints; direct `schema.parse()` is simpler

### D8: Background Jobs — Redis-Based Leader Election Over k8s CronJob

**Decision:** Use Redis-based leader election (SET NX with TTL) for `autoConfirmOrders` and `refreshAllTrustScores` rather than migrating to k8s CronJobs immediately. CronJob migration is a future optimization.

**Rationale:**
- Only 2 background jobs exist currently (`autoConfirmOrders` every hour, `refreshAllTrustScores` every hour)
- Redis SET NX with a TTL fencing token is simple: `SET job:autoConfirm:lock {replicaId} NX EX 3600`
- k8s CronJobs require separate container images, Helm chart additions, and monitoring — overkill for 2 simple jobs
- Leader election is a standard pattern that works with the existing `setInterval` approach
- If more background jobs are added, migration to k8s CronJobs becomes worthwhile

**Alternatives considered:**
- k8s CronJob — viable but higher operational overhead for 2 jobs; documented as future path
- NATS-based leader election — NATS doesn't have a built-in leader election primitive
- Accept duplicate execution — rejected because duplicate `autoConfirmOrders` could double-confirm marketplace orders

## Consequences

### Positive
- Payment security is hardened against forged webhooks and duplicate delivery
- Content classification failures are caught and retried instead of silently passing
- Web auth is protected against XSS token theft
- Deploys no longer risk killing in-flight payment requests
- All REST endpoints validate input before processing

### Negative
- Cookie-based web auth adds complexity to the auth flow (two paths: cookie vs Bearer)
- NATS durable consumers add message broker dependency for content classification (previously direct function calls)
- Rate limiting adds latency (marginal: <5ms) and requires Redis availability

### Risks
- Cookie domain `.lovelustre.com` requires all web subdomains to be HTTPS — already the case via Cloudflare
- NATS JetStream stream configuration must be correct to avoid message loss — needs integration testing
- Migration period (localStorage → cookie) requires supporting both auth methods temporarily
