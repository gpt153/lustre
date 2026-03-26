# Epic: wave-2a-shop-mobile

**Wave:** 2
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Add a Shop tab to the mobile app: business shop page, product grid, product detail, cart sheet, and checkout flow using the tRPC `shop` router built in Wave 1.

## Context
- Monorepo: shared screens in `packages/app/src/screens/`, hooks in `packages/app/src/hooks/`
- Mobile tabs at `apps/mobile/app/(tabs)/`
- Tamagui for UI components (YStack, XStack, Text, Button, Image, ScrollView, Sheet)
- tRPC client via `packages/api/src/` — use `api.shop.product.list.useQuery()`
- Auth store: `packages/app/src/stores/authStore.ts` — `useAuthStore()` for userId
- Existing screen patterns: `packages/app/src/screens/OrgDetailScreen.tsx` for reference
- Existing tab _layout pattern: `apps/mobile/app/(tabs)/_layout.tsx` for adding tabs
- Shop is accessed from an Org's profile page (orgs with verified status show "Visit Shop" button)

## Files to Create/Edit

1. `packages/app/src/screens/ShopScreen.tsx` — Product grid for a given org's shop
2. `packages/app/src/screens/ProductDetailScreen.tsx` — Product detail with Add to Cart
3. `packages/app/src/screens/CartScreen.tsx` — Cart sheet with line items + checkout button
4. `packages/app/src/hooks/useShop.ts` — tRPC queries: useProducts, useProduct, useCart, useAddToCart, useCheckout
5. `packages/app/src/index.ts` — Export new screens and hook
6. `apps/mobile/app/(tabs)/shop/index.tsx` — Shop tab entry (product grid)
7. `apps/mobile/app/(tabs)/shop/[productId].tsx` — Product detail page
8. `apps/mobile/app/(tabs)/shop/_layout.tsx` — Stack navigator for shop tab

## Acceptance Criteria

1. `packages/app/src/hooks/useShop.ts` exports `useProducts(orgId?)` using `api.shop.product.list.useQuery`, `useProduct(id)` using `api.shop.product.get.useQuery`, `useAddToCart()` mutation using `api.shop.cart.add.useMutation`, `useCheckout()` mutation using `api.shop.cart.checkout.useMutation`
2. `ShopScreen.tsx` renders a 2-column FlatList of product cards; each card shows product title, price (in SEK), and thumbnail image; tapping a card navigates to `ProductDetailScreen`
3. `ShopScreen.tsx` shows a loading skeleton (via Tamagui `Spinner`) while products are fetching, and an empty state text "Inga produkter ännu" when list is empty
4. `ProductDetailScreen.tsx` shows product image gallery (horizontal ScrollView of images), title, price in SEK, description, and an "Lägg i varukorg" (Add to Cart) button that calls `useAddToCart`
5. `ProductDetailScreen.tsx` shows a success toast/alert after adding to cart; shows error message on failure
6. `CartScreen.tsx` renders as a Tamagui `Sheet` (bottom drawer), listing each cart line item with title, quantity, unit price; shows total at bottom; has "Betala med Swish" button
7. `CartScreen.tsx` "Betala med Swish" triggers `useCheckout` with the user's Swish phone from their profile; on success shows confirmation with `swishToken`
8. `apps/mobile/app/(tabs)/shop/_layout.tsx` defines a Stack navigator with `index` and `[productId]` screens
9. `apps/mobile/app/(tabs)/shop/index.tsx` imports and renders `ShopScreen` from packages/app
10. `apps/mobile/app/(tabs)/shop/[productId].tsx` imports and renders `ProductDetailScreen` passing `productId` from route params
