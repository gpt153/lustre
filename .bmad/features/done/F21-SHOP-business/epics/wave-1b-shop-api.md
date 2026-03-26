# Epic: wave-1b-shop-api

**Wave:** 1 (after wave-1a)
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Create a `shop` tRPC router that bridges Lustre's auth system to Medusa's storefront API, exposing product.list, product.get, cart.add, and cart.checkout procedures. Store cart-to-user mapping in a lightweight Prisma model.

## Context
- Medusa v2 storefront API base URL: `http://medusa:9000/store` (internal k8s DNS)
- Medusa publishable API key passed in header `x-publishable-api-key`
- Medusa cart is identified by a cartId (UUID) stored per Lustre user in `ShopCart` table
- Checkout: create Medusa payment session → initiate Swish → existing marketplace Swish infrastructure at `services/api/src/lib/marketplace-swish.ts`
- Existing tRPC pattern: `services/api/src/trpc/org-router.ts` for structure
- Router assembled in `services/api/src/trpc/router.ts` — add `shop: shopRouter`
- Org verification required for businesses to have a shop (check `OrgVerification.status === VERIFIED`)

## Prisma Schema Addition
Add to `services/api/prisma/schema.prisma`:
```prisma
model ShopCart {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @unique @map("user_id") @db.Uuid
  cartId    String   @map("cart_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("shop_carts")
}
```

## Files to Create/Edit

1. `services/api/src/trpc/shop-router.ts` — tRPC shop router with 4 procedures
2. `services/api/src/lib/medusa-client.ts` — Medusa API client (thin fetch wrapper)
3. `services/api/prisma/schema.prisma` — Add ShopCart model + User relation
4. `services/api/prisma/migrations/20260326200000_add_shop_cart/migration.sql` — Migration SQL
5. `services/api/src/trpc/router.ts` — Import and register shopRouter

## Acceptance Criteria

1. `services/api/src/lib/medusa-client.ts` exports `medusaClient` with methods: `getProducts(params)`, `getProduct(id)`, `createCart()`, `getCart(cartId)`, `addLineItem(cartId, variantId, quantity)`, `removeLineItem(cartId, lineItemId)`, `completeCart(cartId)` — all using `fetch` with `x-publishable-api-key: ${MEDUSA_PUBLISHABLE_KEY}` header and base URL `process.env.MEDUSA_INTERNAL_URL ?? 'http://medusa:9000'`
2. `services/api/src/trpc/shop-router.ts` exports `shopRouter` with procedure `product.list` — `publicProcedure`, input `z.object({ orgId: z.string().uuid().optional(), q: z.string().optional(), limit: z.number().default(20), offset: z.number().default(0) })`, returns `{ products, count }`
3. `shop-router.ts` has procedure `product.get` — `publicProcedure`, input `z.object({ id: z.string() })`, returns single product with variants and images
4. `shop-router.ts` has procedure `cart.add` — `protectedProcedure`, input `z.object({ variantId: z.string(), quantity: z.number().min(1).default(1) })`. Upserts `ShopCart` via prisma (creates Medusa cart on first add, reuses existing cartId), adds line item, returns updated cart
5. `shop-router.ts` has procedure `cart.checkout` — `protectedProcedure`, input `z.object({ swishPhone: z.string() })`. Gets cart, calls Medusa `completeCart`, then calls `createOrderPaymentRequest` from `services/api/src/lib/marketplace-swish.ts` with cart total, returns `{ swishToken, orderId }`
6. `services/api/prisma/schema.prisma` includes `ShopCart` model exactly as specified in the Context section, and `User` model has `shopCart ShopCart?` relation
7. `services/api/prisma/migrations/20260326200000_add_shop_cart/migration.sql` creates `shop_carts` table with all columns and foreign key to `users`
8. `services/api/src/trpc/router.ts` imports `{ shopRouter } from './shop-router.js'` and adds `shop: shopRouter` to the `appRouter`
9. No TODO/FIXME comments — all error handling uses `TRPCError` with correct codes (NOT_FOUND, INTERNAL_SERVER_ERROR)
10. `medusa-client.ts` handles non-2xx responses by throwing `TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Medusa API error' })`
