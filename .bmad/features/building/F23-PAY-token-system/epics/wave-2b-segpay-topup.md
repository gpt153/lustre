# Epic: wave-2b-segpay-topup

**Wave:** 2
**Model:** sonnet
**Status:** NOT_STARTED

## Goal
Segpay API integration: card registration (tokenization), one-time payment, recurring setup, callback handling, token credit.

## Context

### Segpay is an adult content payment processor
- REST API with Basic Auth (API key + secret)
- Card tokenization: POST to Segpay tokenize endpoint, returns card token
- Charge: POST to Segpay charge endpoint with card token + amount
- Env vars: `SEGPAY_API_URL`, `SEGPAY_API_KEY`, `SEGPAY_API_SECRET`, `SEGPAY_CALLBACK_URL`

### tokens.ts
- `creditTokens(prisma, userId, amount, type, referenceId?)` — use type `'TOPUP'`

### Schema additions needed (SEPARATE migration from 2a — different prefix)
New migration: `20260326260000_f23_segpay`

New Prisma models:
```prisma
model SegpayCard {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  cardToken   String   @map("card_token") @db.VarChar(500)
  last4       String   @map("last4") @db.VarChar(4)
  brand       String   @db.VarChar(50) // VISA, MC, etc
  expiryMonth Int      @map("expiry_month")
  expiryYear  Int      @map("expiry_year")
  isDefault   Boolean  @default(false) @map("is_default")
  createdAt   DateTime @default(now()) @map("created_at")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("segpay_cards")
}

model SegpayTransaction {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @map("user_id") @db.Uuid
  segpayTxId      String?  @map("segpay_tx_id") @db.VarChar(200)
  amountSek       Decimal  @db.Decimal(10, 2) @map("amount_sek")
  tokensCredit    Decimal  @db.Decimal(20, 5) @map("tokens_credit")
  status          String   @default("PENDING") // PENDING, COMPLETED, FAILED, REFUNDED
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("segpay_transactions")
}
```

Add relations to User model:
- `segpayCards       SegpayCard[]`
- `segpayTransactions SegpayTransaction[]`

### payment-router.ts (wave-2a creates this file)
Wave-2b adds Segpay procedures to the SAME payment-router.ts. Since these run in parallel, wave-2b should create payment-router.ts with ALL payment procedures (both Swish from 2a and Segpay from 2b). However, since wave-2a runs in parallel, we might have a merge conflict. To avoid this:

**wave-2b creates a separate file `services/api/src/trpc/segpay-router.ts`** and registers it in `router.ts` as `segpay: segpayRouter`. The wave-2a payment router only has Swish procedures.

## Acceptance Criteria
1. New file `services/api/src/lib/segpay.ts` with:
   - `tokenizeCard(userId, cardData)` — calls Segpay tokenize API (POST), returns `{ cardToken, last4, brand, expiryMonth, expiryYear }`; `cardData`: `{ number, cvv, expiryMonth, expiryYear, holderName }`
   - `chargeCard(cardToken, amountSek)` — calls Segpay charge API, returns `{ txId, success }`
   - `handleSegpayCallback(prisma, payload)` — handles Segpay payment callback, if status=APPROVED: find SegpayTransaction by segpayTxId, credit tokens (1 SEK = 1 token), mark COMPLETED
2. New tRPC router `services/api/src/trpc/segpay-router.ts`:
   - `segpay.addCard` — mutation, input: `{ number: z.string(), cvv: z.string(), expiryMonth: z.number(), expiryYear: z.number(), holderName: z.string() }`, calls tokenizeCard, stores SegpayCard, returns card info without full number
   - `segpay.listCards` — query, returns user's cards (no full card numbers, only last4/brand/expiry/isDefault)
   - `segpay.removeCard` — mutation, input: `{ cardId: z.string().uuid() }`, deletes card (must own it)
   - `segpay.setDefaultCard` — mutation, input: `{ cardId: z.string().uuid() }`, sets isDefault (unsets others)
   - `segpay.topup` — mutation, input: `{ amountSek: z.number().min(10).max(10000), cardId: z.string().uuid().optional() }` (uses default card if no cardId), creates SegpayTransaction(PENDING), calls chargeCard, on success marks COMPLETED + credits tokens
3. REST endpoint `POST /api/payments/segpay-callback` — calls handleSegpayCallback
4. `segpayRouter` exported and registered in `router.ts` as `segpay: segpayRouter`
5. Migration SQL created at `services/api/prisma/migrations/20260326260000_f23_segpay/migration.sql`
6. Schema updated with SegpayCard, SegpayTransaction models, User relations
7. Use `node-fetch` or `https` for API calls — keep it simple with JSON POST
8. No TODO/FIXME
9. Card numbers NEVER stored — only cardToken (tokenization pattern)

## Files to Create/Modify
- `services/api/prisma/schema.prisma` — add SegpayCard, SegpayTransaction, User relations
- `services/api/prisma/migrations/20260326260000_f23_segpay/migration.sql` — migration
- `services/api/src/lib/segpay.ts` — new file
- `services/api/src/trpc/segpay-router.ts` — new file
- `services/api/src/trpc/router.ts` — register segpayRouter
- `services/api/src/index.ts` — register Segpay callback REST route
