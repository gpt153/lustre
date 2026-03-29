# Epic: wave-1-payment-security

**Model:** sonnet
**Wave:** 1

## Description

Add cryptographic signature validation to all payment webhook endpoints and implement idempotency keys to prevent duplicate token credits. This is the highest-priority security fix — without it, anyone can POST fake payment callbacks and credit themselves unlimited tokens.

Swish uses mTLS (client certificate verification against Swish CA). Segpay uses HMAC-SHA256 with a shared secret. All payment-triggered token mutations get a unique constraint on the natural idempotency key (payment reference) and use upsert to make duplicate deliveries harmless.

Requires a Prisma migration to add unique constraints and an `externalReference` field to `TokenTransaction`.

## Acceptance Criteria

1. Given a POST to `/swish/callback`, when the request does not originate from a verified Swish client certificate (mTLS), then the endpoint returns 401 and no `TokenTransaction` is created
2. Given a POST to `/api/payments/segpay-callback`, when the `X-Segpay-Signature` header is missing or does not match `HMAC-SHA256(rawBody, SEGPAY_WEBHOOK_SECRET)`, then the endpoint returns 401
3. Given all Swish callback endpoints (`/swish/callback`, `/api/marketplace/swish-callback`, `/api/payments/swish-recurring-callback`, `/api/events/ticket-callback`), when signature validation is enabled, then each endpoint has a `verifySwishCallback` guard that runs before business logic
4. Given `TokenTransaction` model, when migrated, then it has a new `externalReference String?` field and a unique constraint on `@@unique([type, externalReference])`
5. Given a Swish callback with `paymentReference: "ABC123"` that has already been processed, when the same callback is received again, then the upsert returns the existing record and token balance is NOT incremented
6. Given `EventTicket` creation in `event-tickets.ts`, when the same `paymentReference` is received twice, then only one ticket is created (unique constraint on `paymentReference`)
7. Given marketplace order confirmation in `marketplace.ts`, when the same order callback is received twice, then the order status update is idempotent (no double-confirmation)
8. Given `SegpayTransaction`, when a duplicate `transactionId` callback arrives, then the upsert pattern prevents duplicate rows
9. Given a new env var `SEGPAY_WEBHOOK_SECRET`, then it is documented in `.env.example` and the Helm chart secrets
10. Given a new Prisma migration, then `pnpm prisma migrate dev` succeeds and the schema is consistent

## File Paths

- `services/api/src/auth/swish.ts`
- `services/api/src/lib/tokens.ts`
- `services/api/src/lib/event-tickets.ts`
- `services/api/src/lib/marketplace.ts`
- `services/api/src/lib/swish-recurring.ts`
- `services/api/src/lib/segpay.ts`
- `services/api/src/routes/marketplace-callback.ts`
- `services/api/prisma/schema.prisma`
