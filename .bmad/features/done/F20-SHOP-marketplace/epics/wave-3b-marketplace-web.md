# Epic: wave-3b-marketplace-web

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3a)

## Description

Build web marketplace pages using Next.js App Router, Tamagui, and shared hooks from packages/app. Same features as mobile: browse, detail, create, order flow, order status.

## Acceptance Criteria

1. `apps/web/app/(app)/shop/page.tsx` — marketplace listing browse. Uses `trpc.listing.list` with infinite scroll (IntersectionObserver), category filter sidebar/tabs, shows ListingCard components in a responsive grid (3 cols desktop, 2 tablet, 1 mobile).
2. `apps/web/app/(app)/shop/listing/[listingId]/page.tsx` — listing detail. Image gallery (CSS grid horizontal scroll), title, description, price in SEK, category, shipping options, seller displayName, "Köp nu" button (hidden if own listing).
3. `apps/web/app/(app)/shop/create/page.tsx` — create listing form. Fields: title, description, price (SEK), category select, shipping checkboxes, image upload (up to 8, HTML file input). Calls `trpc.listing.create` mutation.
4. `apps/web/app/(app)/shop/order/[orderId]/page.tsx` — order status page. Shows timeline, tracking number, confirm delivery button if buyer and SHIPPED.
5. Uses `useMarketplace` hook from `packages/app/src/hooks/useMarketplace.ts` (same hook as mobile).
6. Nav link "Shop" added to web app layout at `apps/web/app/(app)/layout.tsx`.
7. Price display helper: show prices in SEK (divide by 100), e.g. "249 kr".
8. Anonymity enforced: seller shown as User.displayName only, never real name.

## File Paths

- `apps/web/app/(app)/shop/page.tsx` (new)
- `apps/web/app/(app)/shop/listing/[listingId]/page.tsx` (new)
- `apps/web/app/(app)/shop/create/page.tsx` (new)
- `apps/web/app/(app)/shop/order/[orderId]/page.tsx` (new)
- `apps/web/app/(app)/layout.tsx` (add Shop nav link)
