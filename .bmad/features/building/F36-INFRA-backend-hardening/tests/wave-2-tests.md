# Test Spec: Wave 2 — Graceful Shutdown + Zod Validation

## Scope

Verify that the API shuts down gracefully on SIGTERM/SIGINT (draining in-flight requests, closing connections) and that all REST endpoints validate input via Zod schemas.

---

## T2.1: Graceful Shutdown

**Tool:** Vitest
**File:** `services/api/src/__tests__/graceful-shutdown.test.ts`

### Unit Tests

1. **shutdown handler registered** — Given the server starts, when inspecting process listeners, then handlers exist for both `SIGTERM` and `SIGINT`
2. **shutdown calls fastify.close** — Given SIGTERM is emitted, when the shutdown handler runs, then `fastify.close()` is called
3. **shutdown drains NATS** — Given SIGTERM and Fastify close completes, when NATS connection exists, then `nc.drain()` is called
4. **shutdown quits Redis** — Given SIGTERM and NATS drain completes, when Redis client exists, then `redis.quit()` is called
5. **shutdown disconnects Prisma** — Given SIGTERM and Redis quit completes, when Prisma client exists, then `prisma.$disconnect()` is called
6. **shutdown order** — Given SIGTERM, when the shutdown sequence completes, then the call order is: fastify.close → nc.drain → redis.quit → prisma.$disconnect (verified via mock call order)

### Integration Tests

7. **In-flight request completes on SIGTERM** — Start the server, send a request that takes 2 seconds (mock slow handler), send SIGTERM immediately after. Assert the request completes with 200 (not connection reset)
8. **New requests rejected after SIGTERM** — Start the server, send SIGTERM, then try to connect. Assert connection is refused or returns 503

### Manual Verification

- [ ] Run the API locally, send SIGTERM via `kill -TERM <pid>`, verify clean exit (no crash, no unhandled promise)
- [ ] Run the API locally, start a long request, send SIGTERM, verify the request completes
- [ ] Check logs for ordered shutdown messages: "shutdown initiated", "fastify closed", "nats drained", "redis closed", "prisma disconnected"

---

## T2.2: Zod Validation on REST Endpoints

**Tool:** Vitest + Fastify inject
**File:** `services/api/src/__tests__/rest-validation.test.ts`

### Unit Tests — Schema Correctness

1. **SwishCallbackSchema — valid payload** — Given a complete Swish callback body (`{ payeePaymentReference, paymentReference, status, amount, currency }`), when parsed, then it succeeds
2. **SwishCallbackSchema — missing paymentReference** — Given a body without `paymentReference`, when parsed, then Zod throws with path `['paymentReference']`
3. **SwishCallbackSchema — wrong type** — Given `{ amount: "not-a-number" }`, when parsed, then Zod throws with expected type error
4. **SegpayCallbackSchema — valid payload** — Given a complete Segpay callback body, when parsed, then it succeeds
5. **MediaConvertWebhookSchema — valid payload** — Given a valid SNS notification body, when parsed, then it succeeds

### Integration Tests — Endpoint Responses

6. **POST /swish/callback — empty body → 400** — Send a POST with `{}`. Assert response is `{ statusCode: 400, error: 'Bad Request' }` with Zod error details
7. **POST /swish/callback — extra fields accepted** — Send a POST with valid fields plus extra unknown fields. Assert response is 200 (Zod passthrough or strip, not reject)
8. **POST /api/payments/segpay-callback — malformed JSON → 400** — Send a POST with invalid JSON string. Assert 400
9. **POST /api/photos/upload — missing required query params → 400** — Send upload without required metadata. Assert 400 with field path
10. **POST /api/consent/mediaconvert-webhook — missing fields → 400** — Send SNS notification without required fields. Assert 400

### Manual Verification

- [ ] Send malformed JSON to each REST endpoint via curl — verify 400 response (not 500)
- [ ] Verify error response includes the Zod issue path and message for debugging
- [ ] Confirm existing valid payloads still pass validation (no regression)
- [ ] Check that tRPC endpoints are unaffected (they already use Zod via tRPC input schemas)
