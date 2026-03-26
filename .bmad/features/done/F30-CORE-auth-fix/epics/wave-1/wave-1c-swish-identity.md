# Epic: wave-1c-swish-identity
**Model:** sonnet
**Wave:** 1
**Group:** B (parallel with wave-1b, after wave-1a)

## Goal
Extend the existing `swish.ts` to handle the full registration identity flow: Swish payment callback extracts name + phone number, triggers SPAR age verification, creates user account with phone-based identity, and stores encrypted real name.

## Codebase Context

### Existing swish.ts
`services/api/src/auth/swish.ts` — currently handles Swish Handel API payment creation and callback for the 10 SEK registration fee. The callback receives payment confirmation. This epic extends it to also extract identity data (name, phone) from the Swish Handel API response.

### Swish Handel API callback payload
The Swish Handel API v2 callback includes:
```json
{
  "id": "payment-uuid",
  "payeePaymentReference": "our-ref",
  "paymentReference": "swish-ref",
  "callbackUrl": "our-callback",
  "payerAlias": "46701234567",  // <-- payer phone number
  "payeeAlias": "1234567890",
  "amount": 10.00,
  "currency": "SEK",
  "message": "Lustre verification",
  "status": "PAID",
  "dateCreated": "...",
  "datePaid": "...",
  "payerPaymentReference": null,
  "payerName": "John Doe"  // <-- only in Handel API (not consumer)
}
```

### SPAR service (created in wave-1b)
`services/api/src/auth/spar.ts` — `lookupSpar(name, phone)` returns `{ birthDate, firstName, lastName, isAdult, age }`

### Crypto module
`services/api/src/auth/crypto.ts` — `encryptIdentity(data)` stores AES-256-GCM encrypted PII in encrypted_identities table

### JWT module
`services/api/src/auth/jwt.ts` — `generateTokens(userId)` returns `{ accessToken, refreshToken }`

### Registration tRPC router
The auth router handles registration endpoints. The Swish callback should:
1. Extract payerAlias (phone) and payerName from callback
2. Check phone uniqueness (phoneHash)
3. Call `lookupSpar(payerName, payerAlias)`
4. If under 18: refund via Swish refund API, reject
5. If 18+: create User with phone + phoneHash, store encrypted identity, set status PENDING_EMAIL (new status for email setup step)
6. Return a temporary registration token for the email/password setup step

### Refund flow
If age check fails, call Swish refund endpoint:
`PUT /api/v2/refunds/{instructionUUID}` with original paymentReference

## Acceptance Criteria
1. `services/api/src/auth/swish.ts` callback handler extracts `payerAlias` (phone) and `payerName` from Swish Handel API response
2. Phone number uniqueness enforced via SHA-256 hash in `phoneHash` column before creating user
3. SPAR lookup triggered with extracted name + phone; under-18 triggers Swish refund and registration denial
4. On successful verification: User created with `phone`, `phoneHash`, status set to indicate pending email setup
5. Real name from SPAR stored via existing `crypto.encryptIdentity()` in encrypted_identities table
6. Registration endpoint returns temporary token (short-lived JWT, 15min) for completing email/password setup
7. Swish callback is idempotent — duplicate callbacks for same payment do not create duplicate users
8. Swish refund API called correctly when under-18 detected

## Files to Create/Edit
- `services/api/src/auth/swish.ts` (EDIT — extend callback handling)
- `services/api/src/trpc/auth-router.ts` (EDIT — update registration flow)
