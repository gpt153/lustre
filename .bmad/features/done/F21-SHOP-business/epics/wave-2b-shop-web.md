# Epic: wave-2b-shop-web

**Wave:** 2
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Add web shop pages to the Next.js app: product grid, product detail, cart sidebar, and checkout flow mirroring the mobile experience.

## Context
- Next.js app at `apps/web/app/`
- Server components for data fetching where possible, client components for interactive parts
- tRPC client: `packages/api/src/` — use `api.shop.product.list.useQuery()` in client components
- Existing web page patterns: `apps/web/app/(app)/learn/page.tsx` for structure
- Tailwind CSS + shadcn/ui components for styling (existing web uses these)
- Shop route: `apps/web/app/(app)/shop/`
- Cart state managed via `useShop` hook (shared with mobile, from packages/app/src/hooks/useShop.ts)
- A floating cart button with item count badge in the shop layout

## Files to Create/Edit

1. `apps/web/app/(app)/shop/page.tsx` — Product grid page (Client Component)
2. `apps/web/app/(app)/shop/[productId]/page.tsx` — Product detail page (Client Component)
3. `apps/web/app/(app)/shop/layout.tsx` — Shop layout with CartSidebar component
4. `apps/web/app/(app)/shop/components/CartSidebar.tsx` — Sliding cart panel
5. `apps/web/app/(app)/shop/components/ProductCard.tsx` — Product card for grid
6. `apps/web/app/(app)/shop/components/ProductGallery.tsx` — Image gallery for detail page

## Acceptance Criteria

1. `apps/web/app/(app)/shop/page.tsx` is a `'use client'` component that uses `useProducts()` from `useShop` hook; renders a responsive 3-column grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3); shows loading spinner while fetching
2. `apps/web/app/(app)/shop/page.tsx` includes a search input that filters products via `q` param (debounced 300ms); shows "Inga produkter ännu" on empty results
3. `ProductCard.tsx` renders product image (next/image with fill), title, price in SEK formatted as `X kr`, and a "Visa" link to `/shop/[productId]`; wraps in a card with hover shadow
4. `apps/web/app/(app)/shop/[productId]/page.tsx` uses `useProduct(productId)` from `useShop`; renders `ProductGallery` + product info + "Lägg i varukorg" button calling `useAddToCart`
5. `ProductGallery.tsx` renders main image + thumbnail row; clicking thumbnail swaps main image; uses `useState` for selected image index
6. `CartSidebar.tsx` is a `'use client'` component rendering a fixed right panel (w-96) that slides in when cart has items; lists line items with title/qty/price; shows total; has "Betala med Swish" button triggering `useCheckout`
7. `apps/web/app/(app)/shop/layout.tsx` wraps children in a relative div alongside `CartSidebar`; exports default layout component
8. Cart button (floating bottom-right) with item count badge is in `layout.tsx`; clicking opens cart sidebar via `useState`
9. All components handle loading and error states gracefully — no unhandled promise rejections or blank screens
10. No TODO/FIXME comments — production-ready code throughout
