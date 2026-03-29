# PRD: Backend Hardening & Stability

## Overview

Harden the Lustre backend for production readiness. The codebase has ~40 tRPC routers, 100+ Prisma models, and serves both a Next.js web app and Expo React Native mobile app through a single Fastify 5 API. This feature addresses critical security vulnerabilities in payment webhooks, replaces fire-and-forget async patterns with durable message consumers, migrates web auth from localStorage to HttpOnly cookies, and adds operational safeguards (graceful shutdown, rate limiting, input validation, audit trail, API versioning).

Domain-based development (Cloudflare Tunnel routing to `app.lovelustre.com`, `api.lovelustre.com`, `pay.lovelustre.com`, `admin.lovelustre.com`) has already been implemented and is COMPLETE.

## Target Audience

Internal — engineering team. No user-facing UI changes. All changes are API-layer, infrastructure, and security.

## Problem Statement

The API is functionally complete but has security and stability gaps that are unacceptable for a production launch handling real payments, sensitive user data, and content moderation:

1. **Payment webhooks accept unsigned payloads** — anyone can POST fake callbacks and credit tokens
2. **No idempotency** — duplicate webhook delivery credits tokens twice
3. **Fire-and-forget tasks silently fail** — if Sightengine is down, sexual content passes unfiltered
4. **No graceful shutdown** — deploys can interrupt in-flight payments
5. **REST endpoints skip validation** — `request.body as Type` casts without runtime checks
6. **Web auth uses localStorage** — vulnerable to XSS token theft
7. **No rate limiting on REST endpoints** — uploads and callbacks can be hammered
8. **Background jobs run on all replicas** — `setInterval` not cluster-safe
9. **No audit trail** — admin actions lack comprehensive logging
10. **Gatekeeper prompt injection risk** — user dealbreakers interpolated directly into system prompt

## Completed Work

### Domain-Based Development (DONE)
- All app-facing URLs migrated from localhost to real domains via Cloudflare Tunnel
- CORS is env-driven via `CORS_ORIGINS` (default: `app.lovelustre.com, pay.lovelustre.com, admin.lovelustre.com`)
- Infrastructure services (Redis, PostgreSQL, Meilisearch, NATS) remain localhost — Docker-internal
- Landing page (`lovelustre.com`) is a separate app, does NOT call API
- Playwright and test configs updated to domain-based URLs with env overrides

## Functional Requirements

### FR-1: Payment Webhook Signature Validation (CRITICAL)
- Priority: Must
- Acceptance criteria:
  - Given a Swish callback to `/swish/callback`, `/api/marketplace/swish-callback`, `/api/payments/swish-recurring-callback`, or `/api/events/ticket-callback`, when the request lacks a valid HMAC-SHA256 signature header, then the server returns 401 and does NOT process the payment
  - Given a Segpay callback to `/api/payments/segpay-callback`, when the request lacks valid Segpay signature verification, then the server returns 401
  - Given a valid signed callback, when signature verification passes, then the payment is processed normally

### FR-2: Idempotency Keys on Payment Mutations (CRITICAL)
- Priority: Must
- Acceptance criteria:
  - Given a duplicate webhook delivery with the same payment reference, when processed, then token balance is credited exactly once (upsert pattern)
  - Given `TokenTransaction`, when a payment reference is reprocessed, then a unique constraint on `(type, externalReference)` prevents duplicate rows
  - Idempotency applies to: TokenTransaction, SwishRecurringAgreement payments, SegpayTransaction, EventTicket purchases, marketplace Order confirmations

### FR-3: Graceful Shutdown (HIGH)
- Priority: Must
- Acceptance criteria:
  - Given SIGTERM, when received, then Fastify drains in-flight requests (30s timeout), NATS consumers unsubscribe, Redis and Prisma connections close cleanly
  - Given an in-progress payment during deploy, then it completes before the process exits

### FR-4: Zod Validation on REST Endpoints (HIGH)
- Priority: Must
- Acceptance criteria:
  - Given all REST endpoints (`/swish/callback`, `/api/photos/upload`, `/api/posts/upload`, `/api/chat/upload`, `/api/consent/mediaconvert-webhook`, `/api/marketplace/swish-callback`, `/api/payments/swish-recurring-callback`, `/api/payments/segpay-callback`, `/api/events/ticket-callback`), when request body is received, then it is validated through a Zod schema before processing
  - Given an invalid payload, then the server returns 400 with a structured error (not a 500 crash)

### FR-5: Web Auth Migration to HttpOnly Cookies (HIGH)
- Priority: Must
- Acceptance criteria:
  - Given a web client login, when successful, then JWT is set as an HttpOnly, Secure, SameSite=Lax cookie (not stored in localStorage)
  - Given an existing web client using localStorage, then a migration path exists (read old token, set cookie, clear localStorage)
  - Given a mobile client (Expo), then auth continues to use SecureStore + Bearer header (no cookie)
  - Given the tRPC context, then it reads auth from cookie (web) OR Authorization header (mobile)

### FR-6: Rate Limiting on REST Endpoints (HIGH)
- Priority: Should
- Acceptance criteria:
  - Given upload endpoints (`/api/photos/upload`, `/api/posts/upload`, `/api/chat/upload`), then they are rate-limited per authenticated user
  - Given payment callback endpoints, then they are rate-limited per IP
  - Rate limiter uses `@fastify/rate-limit` with Redis backing store

### FR-7: Durable NATS Consumers (HIGH)
- Priority: Should
- Acceptance criteria:
  - Given `classifyAndTagMedia`, `classifyChatMedia`, and `indexProfile`, when the external service (Sightengine, Meilisearch) is unavailable, then the message is retried with exponential backoff (max 5 retries)
  - Given a message that fails all retries, then it is moved to a dead-letter subject for manual inspection
  - Given content classification failure, then media is flagged as `needs_review` (conservative fallback) instead of passing unfiltered

### FR-8: Background Job Cluster Safety (MEDIUM)
- Priority: Should
- Acceptance criteria:
  - Given `autoConfirmOrders` and `refreshAllTrustScores` running on multiple API replicas, then only one replica executes each job at a time
  - Solution: k8s CronJob manifests OR Redis-based leader election with fencing token

### FR-9: Redis High Availability Prep (MEDIUM)
- Priority: Should
- Acceptance criteria:
  - Given the Redis Helm chart, when Sentinel mode is enabled, then the API connects via Sentinel-aware client
  - Given Redis Sentinel config, then it is documented and ready to activate for production

### FR-10: Audit Trail (MEDIUM)
- Priority: Should
- Acceptance criteria:
  - Given any admin mutation (ban, suspend, resolve report, take action), then an `AuditLog` record is created with: adminId, action, targetType, targetId, metadata (JSON), timestamp
  - Given `AuditLog` Prisma model, then it is queryable by admin via tRPC

### FR-11: Gatekeeper Prompt Sanitization (MEDIUM)
- Priority: Should
- Acceptance criteria:
  - Given user dealbreakers embedded in the Gatekeeper system prompt, when a dealbreaker contains potential prompt injection text, then it is sanitized (stripped of instruction-like patterns) before inclusion
  - Dealbreakers are passed as structured JSON parameters, not interpolated into the prompt string

### FR-12: API Versioning for Multi-Client Support (MEDIUM)
- Priority: Could
- Acceptance criteria:
  - Given a client request, when `X-Client-Version` header is present, then the API can enforce minimum version requirements
  - Given a client below minimum version, then the API returns a 426 Upgrade Required response with update instructions

## Non-Functional Requirements

- **Zero downtime:** Each wave can be deployed independently without breaking existing clients
- **Backward compatible:** Web clients with localStorage auth continue to work during migration period
- **Test coverage:** All payment webhook validation must have integration tests with fake/replayed callbacks
- **No new runtime deps except:** `@fastify/rate-limit`, `@fastify/cookie` (both Fastify ecosystem)
- **Type safety:** All Zod schemas must infer TypeScript types that match existing handler expectations
- **Performance:** Rate limiting and signature verification add <5ms p99 latency per request

## Key Files

| Area | File |
|------|------|
| Main server | `services/api/src/server.ts` |
| Swish auth | `services/api/src/auth/swish.ts` |
| Token ops | `services/api/src/lib/tokens.ts` |
| Content classification | `services/api/src/lib/sightengine.ts` |
| Chat classification | `services/api/src/lib/chat-classifier.ts` |
| Redis client | `services/api/src/lib/redis.ts` |
| NATS client | `services/api/src/lib/nats.ts` |
| Meilisearch client | `services/api/src/lib/meilisearch.ts` |
| tRPC context | `services/api/src/trpc/context.ts` |
| Auth middleware | `services/api/src/trpc/middleware.ts` |
| Event tickets | `services/api/src/lib/event-tickets.ts` |
| Marketplace | `services/api/src/lib/marketplace.ts` |
| Swish recurring | `services/api/src/lib/swish-recurring.ts` |
| Segpay | `services/api/src/lib/segpay.ts` |
| Marketplace callback | `services/api/src/routes/marketplace-callback.ts` |
| Gatekeeper AI | `services/api/src/lib/gatekeeper-ai.ts` |
| Trust score | `services/api/src/lib/trust-score.ts` |
| Prisma schema | `services/api/prisma/schema.prisma` |
| Web tRPC client | `apps/web/lib/trpc.tsx` |
| Helm charts | `infrastructure/helm/` |

## Out of Scope

- Push notifications (FCM/APNs, Web Push) — separate feature
- Offline queue for native (React Query onlineManager) — separate feature
- Server-side tRPC calls in Next.js RSC — optimization, not stability
- Full Redis Sentinel deployment — only prep/config in this feature
