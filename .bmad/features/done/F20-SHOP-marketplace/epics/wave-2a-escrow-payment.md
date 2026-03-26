# Epic: wave-2a-escrow-payment

**Model:** sonnet
**Wave:** 2
**Group:** A (first in sequence)

## Description

Implement Swish Handel escrow payment for marketplace orders. Buyer pays Lustre's merchant Swish account. Funds are held (escrow) until delivery confirmation. Reuses the existing Swish mTLS infrastructure from `services/api/src/auth/swish.ts`.

## Acceptance Criteria

1. `MarketplacePayment` model added to Prisma schema: id (uuid), orderId (uuid unique FK to Order), swishPaymentId (String unique), swishToken (String), amountSEK (Int), status (PaymentStatus: PENDING/PAID/DECLINED/ERROR), payerAlias (String?), createdAt, updatedAt. @@map("marketplace_payments"). Migration at `services/api/prisma/migrations/20260326210000_add_marketplace_payments/migration.sql`.
2. `services/api/src/lib/marketplace-swish.ts` — new file. Function `createOrderPaymentRequest(prisma, orderId, buyerId, payerPhoneNumber?)`: validates order is PLACED and buyer matches, calls Swish API (POST /paymentrequests) using same mTLS pattern as `src/auth/swish.ts`, amount = order.amountSEK/100 (convert öre to SEK, format "X.XX"), message = "Lustre Marketplace — köp", stores MarketplacePayment record, returns {swishPaymentId, paymentRequestToken}.
3. `services/api/src/routes/marketplace-callback.ts` — REST callback handler. POST /api/marketplace/swish-callback: validates Swish callback body (same SwishCallbackBody type from auth/swish.ts), on PAID: updates MarketplacePayment status=PAID, updates Order status=PAID, paidAt=now(), marks Listing status=SOLD (via $transaction). On DECLINED/ERROR: updates payment status accordingly.
4. `order.initiatePayment` tRPC mutation — protectedProcedure, input: orderId, phoneNumber (optional). Only buyer of that order. Order must be PLACED. Calls createOrderPaymentRequest. Returns {swishPaymentId, paymentRequestToken}.
5. `order.checkPaymentStatus` tRPC query — protectedProcedure, input: orderId. Returns {paymentStatus: PaymentStatus | null, paidAt: DateTime | null} from MarketplacePayment.
6. Callback route registered in `services/api/src/server.ts` as `fastify.post('/api/marketplace/swish-callback', marketplaceCallbackHandler)`.
7. Commission field `commissionSEK` in Order is already set at order creation (10%) — no change needed here.

## File Paths

- `services/api/prisma/schema.prisma` (add MarketplacePayment model)
- `services/api/prisma/migrations/20260326210000_add_marketplace_payments/migration.sql` (new)
- `services/api/src/lib/marketplace-swish.ts` (new)
- `services/api/src/routes/marketplace-callback.ts` (new)
- `services/api/src/trpc/order-router.ts` (add initiatePayment and checkPaymentStatus)
- `services/api/src/server.ts` (register callback route)
