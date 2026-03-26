# Epic: wave-3a-marketplace-mobile

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3b)

## Description

Build mobile marketplace screens using Expo Router and shared components in packages/app. Covers listing browse, listing detail, create listing, order placement, and order status tracking.

## Acceptance Criteria

1. `MarketplaceListScreen` in `packages/app/src/screens/MarketplaceListScreen.tsx` — uses `trpc.listing.list.useInfiniteQuery`, shows ListingCard components in a FlatList with infinite scroll, category filter tabs at top (ALL, UNDERWEAR, TOYS, FETISH_ITEMS, HANDMADE_GOODS, ACCESSORIES, CLOTHING, OTHER), pull-to-refresh.
2. `ListingCard` in `packages/app/src/components/ListingCard.tsx` — shows first image (or placeholder), title, price formatted as "X kr", category badge, seller displayName.
3. `ListingDetailScreen` in `packages/app/src/screens/ListingDetailScreen.tsx` — takes listingId prop, uses `trpc.listing.getById.useQuery`, shows all images (horizontal scroll), title, description, price, category, shipping options, seller displayName, "Köp nu" (Buy Now) button if not own listing.
4. `CreateListingScreen` in `packages/app/src/screens/CreateListingScreen.tsx` — form: title, description, price (number input in SEK, convert to öre internally), category picker, shipping checkboxes, image picker (up to 8 via expo-image-picker). On submit calls `trpc.listing.create.useMutation`. Returns to previous screen on success.
5. `OrderStatusScreen` in `packages/app/src/screens/OrderStatusScreen.tsx` — takes orderId prop, uses `trpc.order.getStatus.useQuery`, shows order status timeline (PLACED → PAID → SHIPPED → DELIVERED → COMPLETED), tracking number if available, confirm delivery button if status=SHIPPED and user is buyer.
6. `useMarketplace` hook in `packages/app/src/hooks/useMarketplace.ts` — wraps listing.list infinite query, listing.create, listing.remove mutations, order.create, order.confirmDelivery mutations. Exposes: listings, fetchMore, createListing, removeListing, createOrder, confirmDelivery, isLoading.
7. Mobile tab: `apps/mobile/app/(tabs)/shop.tsx` — renders MarketplaceListScreen. FAB or header button "Sälj" navigates to create listing. Tab registered in `apps/mobile/app/(tabs)/_layout.tsx` as "Shop".
8. Mobile routes: `apps/mobile/app/(tabs)/shop/listing/[listingId].tsx` (detail), `apps/mobile/app/(tabs)/shop/create.tsx` (create), `apps/mobile/app/(tabs)/shop/order/[orderId].tsx` (order status).
9. Exports added to `packages/app/src/index.ts`.
10. Order placement flow: on "Köp nu" in ListingDetailScreen, show shipping option picker, then call order.create. On success navigate to order status screen.

## File Paths

- `packages/app/src/screens/MarketplaceListScreen.tsx` (new)
- `packages/app/src/screens/ListingDetailScreen.tsx` (new)
- `packages/app/src/screens/CreateListingScreen.tsx` (new)
- `packages/app/src/screens/OrderStatusScreen.tsx` (new)
- `packages/app/src/components/ListingCard.tsx` (new)
- `packages/app/src/hooks/useMarketplace.ts` (new)
- `packages/app/src/index.ts` (add exports)
- `apps/mobile/app/(tabs)/shop.tsx` (new)
- `apps/mobile/app/(tabs)/_layout.tsx` (add Shop tab)
