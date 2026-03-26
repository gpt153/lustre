# Epic: wave-1c-order-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — after 1b)

## Description

Create the tRPC order router for the marketplace. Buyers place orders, sellers mark shipped, buyers confirm delivery (or auto-confirm after 7 days). This is the core lifecycle without payment (payment added in Wave 2).

## Acceptance Criteria

1. `order.create` — protectedProcedure, input: listingId, shippingOption (ShippingOption). Validates listing is ACTIVE and buyer !== seller. Creates Order with buyerId=ctx.userId, sellerId=listing.sellerId, amountSEK=listing.price, commissionSEK=Math.round(listing.price * 0.10), status=PLACED, shippingOption. Does NOT mark listing as SOLD yet (that happens on payment in Wave 2). Returns created order.
2. `order.markShipped` — protectedProcedure, input: orderId, trackingNumber (optional string). Only seller. Order must be in PAID status. Sets status=SHIPPED, shippedAt=now(), autoConfirmAt=now()+7days, trackingNumber. Returns updated order.
3. `order.confirmDelivery` — protectedProcedure, input: orderId. Only buyer. Order must be SHIPPED. Sets status=DELIVERED, deliveredAt=now(). Returns updated order.
4. `order.getStatus` — protectedProcedure, input: orderId. Returns order with listing title, buyer and seller displayName (from User.displayName — NOT real names), all status timestamps. Throws FORBIDDEN if ctx.userId is neither buyer nor seller.
5. `order.getMyOrders` — protectedProcedure. Returns all orders where ctx.userId is buyer OR seller, ordered by createdAt desc, with listing title and image (first image url).
6. Auto-confirm cron logic: Create a function `autoConfirmOrders(prisma)` in `services/api/src/lib/marketplace.ts` that finds all orders where status=SHIPPED AND autoConfirmAt <= now(), sets them to status=DELIVERED, deliveredAt=now(). This function is called from a setInterval in `services/api/src/server.ts` every 60 minutes (use setInterval, not a heavy scheduler).
7. `orderRouter` exported from `services/api/src/trpc/order-router.ts` and registered in `appRouter` as `order`.

## File Paths

- `services/api/src/trpc/order-router.ts` (new)
- `services/api/src/lib/marketplace.ts` (new — autoConfirmOrders function)
- `services/api/src/trpc/router.ts` (add orderRouter import and registration)
- `services/api/src/server.ts` (add setInterval call for autoConfirmOrders)
