# Epic: wave-2b-seller-payout

**Model:** sonnet
**Wave:** 2
**Group:** A (sequential — after 2a)

## Description

Implement Swish Payout API to pay the seller when delivery is confirmed. Lustre deducts commission and pays seller the net amount. Uses Swish Utbetalningar (payout) API — different endpoint from Handel payment requests.

## Acceptance Criteria

1. `SellerPayout` model added to Prisma schema: id (uuid), orderId (uuid unique FK), sellerId (uuid FK to User), swishPayoutId (String unique?), amountSEK (Int — net amount after commission), status (PayoutStatus enum: PENDING, PAID, FAILED), errorMessage (String?), initiatedAt (DateTime default now), completedAt (DateTime?). `PayoutStatus` enum added. @@map("seller_payouts"). Migration at `services/api/prisma/migrations/20260326220000_add_seller_payouts/migration.sql`.
2. `services/api/src/lib/seller-payout.ts` — new file. Function `initiateSellerPayout(prisma, orderId)`: loads order with buyer/seller, validates status=DELIVERED and no existing payout (idempotent), calculates netAmount = amountSEK - commissionSEK, gets seller's Swish number from `SellerSwishNumber` table (see AC3), calls Swish Payout API (POST /payouts), stores SellerPayout record, returns payout record. Swish Payout API URL: `${SWISH_API_URL}/payouts` (same mTLS config as auth/swish.ts). Payout payload: { payoutInstructionUUID, payeeAlias: sellerSwishNumber, amount: netAmountSEK, currency: "SEK", message: "Lustre Marketplace — utbetalning" }.
3. `SellerSwishNumber` model: id (uuid), userId (uuid unique FK), swishNumber (String — seller's Swish/phone number), verifiedAt (DateTime?), createdAt. @@map("seller_swish_numbers"). Sellers must register their Swish number before receiving payouts. Migration included in `20260326220000_add_seller_payouts/migration.sql`.
4. `seller.registerSwishNumber` tRPC mutation — protectedProcedure, input: swishNumber (string, Swedish phone format, min 10 chars). Upserts SellerSwishNumber for ctx.userId. Returns {success: true}.
5. `seller.getSwishNumber` tRPC query — protectedProcedure. Returns {swishNumber: string | null} for ctx.userId.
6. Auto-payout trigger: in `order.confirmDelivery` (order-router.ts) — after setting status=DELIVERED, call `initiateSellerPayout(ctx.prisma, orderId)` in a fire-and-forget manner (don't await, catch errors and log). This ensures payout starts automatically on delivery confirmation.
7. Swish Payout callback handler at `POST /api/marketplace/payout-callback` registered in server.ts. Updates SellerPayout status to PAID (completedAt=now()) or FAILED (errorMessage). Same mTLS pattern.
8. `sellerRouter` exported from `services/api/src/trpc/seller-router.ts`, registered in `appRouter` as `seller`.

## File Paths

- `services/api/prisma/schema.prisma` (add SellerPayout, SellerSwishNumber models, PayoutStatus enum)
- `services/api/prisma/migrations/20260326220000_add_seller_payouts/migration.sql` (new)
- `services/api/src/lib/seller-payout.ts` (new)
- `services/api/src/trpc/seller-router.ts` (new — registerSwishNumber, getSwishNumber)
- `services/api/src/trpc/order-router.ts` (modify confirmDelivery to trigger payout)
- `services/api/src/routes/marketplace-callback.ts` (add payout callback handler)
- `services/api/src/server.ts` (register payout callback route, add sellerRouter import)
- `services/api/src/trpc/router.ts` (add sellerRouter)
