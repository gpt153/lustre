# Epic: wave-2-shutdown-validation

**Model:** haiku
**Wave:** 2

## Description

Add graceful shutdown handling to the Fastify server and Zod validation schemas for all REST endpoints. On SIGTERM/SIGINT, the server performs an ordered drain: stop accepting connections, wait for in-flight requests (30s), unsubscribe NATS consumers, close Redis, disconnect Prisma. All REST endpoints that currently use `request.body as Type` get Zod schemas with `.parse()` validation, returning structured 400 errors for invalid payloads.

## Acceptance Criteria

1. Given SIGTERM signal, when received by the API process, then `fastify.close()` is called which stops accepting new connections and drains in-flight requests with a 30-second timeout
2. Given the SIGTERM handler, when Fastify close completes, then NATS connection is drained (`nc.drain()`), Redis client is quit (`redis.quit()`), and Prisma is disconnected (`prisma.$disconnect()`) in that order
3. Given SIGINT signal (local dev), when received, then the same ordered shutdown sequence executes
4. Given `/swish/callback` endpoint, when request body is received, then it is validated against a `SwishCallbackSchema` Zod schema before any business logic runs
5. Given `/api/photos/upload`, `/api/posts/upload`, `/api/chat/upload` endpoints, when the multipart request metadata (query params, headers) is received, then required fields are validated via Zod
6. Given `/api/consent/mediaconvert-webhook`, when request body is received, then it is validated against a `MediaConvertWebhookSchema` Zod schema
7. Given `/api/payments/segpay-callback` and `/api/payments/swish-recurring-callback`, when request body is invalid (missing required fields, wrong types), then the endpoint returns `{ statusCode: 400, error: 'Bad Request', message: <Zod error details> }`
8. Given any REST endpoint with Zod validation, when validation fails, then the response is 400 (not 500) with structured error details including the field path and expected type
9. Given all Zod schemas, when TypeScript compiles, then the inferred types match the existing handler type expectations (no type errors introduced)
10. Given a shutdown during an in-flight payment webhook, when the 30s drain timeout has not elapsed, then the request completes successfully before the process exits

## File Paths

- `services/api/src/server.ts`
- `services/api/src/lib/nats.ts`
- `services/api/src/lib/redis.ts`
- `services/api/src/auth/swish.ts`
- `services/api/src/lib/segpay.ts`
- `services/api/src/lib/swish-recurring.ts`
- `services/api/src/routes/marketplace-callback.ts`
- `services/api/src/lib/event-tickets.ts`
