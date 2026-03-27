# Epic: wave-2a-swish-topup

**Wave:** 2
**Model:** sonnet
**Status:** NOT_STARTED

## Goal
Swish Recurring API integration for auto-topup: setup recurring payment agreement, trigger topup when balance drops below threshold, handle Swish callbacks, credit tokens.

## Context

### Existing Swish auth integration
`services/api/src/auth/swish.ts` already handles one-time Swish payments for registration. Reference its patterns:
- Uses HTTPS mutual TLS with cert from `SWISH_CERT_PATH` / `SWISH_CERT_PASSPHRASE`
- Makes calls to `SWISH_API_URL`
- Merchant number from `SWISH_MERCHANT_NUMBER`

### tokens.ts (already updated)
- `creditTokens(prisma, userId, amount, type, referenceId?)` — credits tokens
- Use type `'TOPUP'`

### TokenTransactionType enum: GATEKEEPER, TOPUP, REFUND, COACH_SESSION

### Existing env vars
```
SWISH_MERCHANT_NUMBER, SWISH_API_URL, SWISH_CALLBACK_URL, SWISH_CERT_PATH, SWISH_CERT_PASSPHRASE
```

### New env vars needed
```
SWISH_RECURRING_CALLBACK_URL — webhook URL for recurring payment callbacks
```

### Schema additions needed
New migration: `20260326250000_f23_swish_recurring`

New Prisma model:
```prisma
model SwishRecurringAgreement {
  id               String   @id @default(uuid()) @db.Uuid
  userId           String   @unique @map("user_id") @db.Uuid
  agreementToken   String   @map("agreement_token") @db.VarChar(500)
  status           String   @default("PENDING") // PENDING, ACTIVE, CANCELLED
  autoTopupAmount  Decimal  @db.Decimal(10, 2) @map("auto_topup_amount")
  lowBalanceThreshold Decimal @db.Decimal(20, 5) @map("low_balance_threshold")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("swish_recurring_agreements")
}
```

Add relation to User model: `swishRecurringAgreement SwishRecurringAgreement?`

## Acceptance Criteria
1. New file `services/api/src/lib/swish-recurring.ts` with:
   - `setupRecurringAgreement(prisma, userId, autoTopupAmount, lowBalanceThreshold)` — creates SwishRecurringAgreement row with PENDING status, returns `{ agreementToken, paymentUrl }` (paymentUrl is where user completes Swish agreement in app)
   - `triggerAutoTopup(prisma, userId)` — checks if balance < lowBalanceThreshold AND status=ACTIVE, calls Swish API to initiate recurring payment, returns `{ triggered: boolean }`
   - `handleRecurringCallback(prisma, payload)` — handles Swish callback, if status=PAID: credits tokens (convert SEK to tokens: 1 SEK = 1 token), updates SwishRecurringAgreement, creates transaction with description "Swish auto-topup"
   - `cancelRecurringAgreement(prisma, userId)` — sets status=CANCELLED
2. New tRPC router `services/api/src/trpc/payment-router.ts`:
   - `payment.setupSwishRecurring` — mutation, input: `{ autoTopupAmount: z.number().min(10).max(1000), lowBalanceThreshold: z.number().min(1) }`, calls setupRecurringAgreement, returns `{ agreementToken, paymentUrl }`
   - `payment.cancelSwishRecurring` — mutation, calls cancelRecurringAgreement
   - `payment.getSwishRecurringStatus` — query, returns current agreement status or null
3. REST endpoint `POST /api/payments/swish-recurring-callback` registered in Fastify app — validates Swish signature, calls handleRecurringCallback
4. `paymentRouter` exported and registered in `router.ts` under key `payment`
5. Migration SQL created at `services/api/prisma/migrations/20260326250000_f23_swish_recurring/migration.sql`
6. Schema.prisma updated with SwishRecurringAgreement model and User relation
7. No TODO/FIXME
8. Swish API calls use `node:https` with `agent` option (same pattern as auth/swish.ts) or `node-fetch` — read existing swish.ts to match the pattern

## Files to Create/Modify
- `services/api/prisma/schema.prisma` — add SwishRecurringAgreement model and User relation
- `services/api/prisma/migrations/20260326250000_f23_swish_recurring/migration.sql` — migration
- `services/api/src/lib/swish-recurring.ts` — new file
- `services/api/src/trpc/payment-router.ts` — new file (will be extended by wave-2b for Segpay)
- `services/api/src/trpc/router.ts` — register paymentRouter
- `services/api/src/index.ts` — register the Swish callback REST route (read file first to see how REST routes are registered)
