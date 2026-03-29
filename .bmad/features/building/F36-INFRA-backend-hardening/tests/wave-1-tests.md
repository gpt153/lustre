# Test Spec: Wave 1 — Payment Security

## Scope

Verify that payment webhook endpoints reject unsigned/forged requests and that duplicate webhook delivery does not double-credit token balances.

---

## T1.1: Swish Webhook Signature Validation

**Tool:** Vitest
**File:** `services/api/src/__tests__/swish-webhook-security.test.ts`

### Unit Tests

1. **verifySwishCallback — valid certificate** — Given a request with a valid Swish client certificate chain, when `verifySwishCallback(req)` is called, then it returns `true`
2. **verifySwishCallback — missing certificate** — Given a request without a client certificate, when `verifySwishCallback(req)` is called, then it returns `false`
3. **verifySwishCallback — wrong CA** — Given a request with a certificate signed by a non-Swish CA, when `verifySwishCallback(req)` is called, then it returns `false`
4. **verifySwishCallback — expired certificate** — Given a request with an expired Swish certificate, when `verifySwishCallback(req)` is called, then it returns `false`

### Integration Tests

5. **POST /swish/callback — unsigned → 401** — Send a POST with a valid Swish callback body but no client certificate. Assert response is 401 and no `TokenTransaction` was created
6. **POST /swish/callback — valid signature → 200** — Send a POST with a valid body and mocked valid certificate verification. Assert response is 200 and `TokenTransaction` was created
7. **POST /api/marketplace/swish-callback — unsigned → 401** — Same test for marketplace callback
8. **POST /api/payments/swish-recurring-callback — unsigned → 401** — Same test for recurring callback
9. **POST /api/events/ticket-callback — unsigned → 401** — Same test for event ticket callback

---

## T1.2: Segpay Webhook Signature Validation

**Tool:** Vitest
**File:** `services/api/src/__tests__/segpay-webhook-security.test.ts`

### Unit Tests

1. **verifySegpaySignature — valid HMAC** — Given a raw body and matching `X-Segpay-Signature` computed as `HMAC-SHA256(body, secret)`, when verified, then it returns `true`
2. **verifySegpaySignature — wrong HMAC** — Given a body with a tampered signature, when verified, then it returns `false`
3. **verifySegpaySignature — missing header** — Given a request without `X-Segpay-Signature`, when verified, then it returns `false`

### Integration Tests

4. **POST /api/payments/segpay-callback — invalid signature → 401** — Send a POST with wrong HMAC. Assert 401 and no `SegpayTransaction` created
5. **POST /api/payments/segpay-callback — valid signature → 200** — Send a POST with correct HMAC. Assert 200 and `SegpayTransaction` created

---

## T1.3: Idempotency Keys

**Tool:** Vitest + Prisma test client
**File:** `services/api/src/__tests__/payment-idempotency.test.ts`

### Unit Tests

1. **TokenTransaction unique constraint** — Given a `TokenTransaction` with `type: TOPUP, externalReference: "ref-001"`, when a second insert with the same `type` + `externalReference` is attempted, then Prisma throws a unique constraint violation
2. **creditTokens idempotent** — Given `creditTokens(userId, 100, 'TOPUP', 'ref-001')` called twice, when the second call uses upsert, then `UserBalance.balance` is incremented only once

### Integration Tests

3. **Duplicate Swish callback — token balance stable** — POST `/swish/callback` with `paymentReference: "ABC123"` twice. Assert `UserBalance.balance` increased by the payment amount exactly once
4. **Duplicate EventTicket callback — one ticket** — POST `/api/events/ticket-callback` with same `paymentReference` twice. Assert exactly 1 `EventTicket` row exists
5. **Duplicate Segpay callback — one transaction** — POST `/api/payments/segpay-callback` with same `transactionId` twice. Assert exactly 1 `SegpayTransaction` row exists
6. **Duplicate marketplace callback — no double confirmation** — POST `/api/marketplace/swish-callback` with same orderId twice. Assert order confirmed exactly once
7. **Concurrent duplicate webhooks — race condition safe** — Fire 5 simultaneous POSTs to `/swish/callback` with the same `paymentReference`. Assert exactly 1 `TokenTransaction` created (tests DB-level constraint under concurrency)

### Manual Verification

- [ ] Deploy to staging, trigger a real Swish test payment, confirm callback creates `TokenTransaction` with `externalReference`
- [ ] Manually replay the same callback via curl — verify no duplicate credit
- [ ] Check `prisma studio` for the unique constraint on `TokenTransaction`
- [ ] Verify Segpay sandbox webhook with correct HMAC is accepted
- [ ] Verify Segpay sandbox webhook with wrong HMAC is rejected with 401
