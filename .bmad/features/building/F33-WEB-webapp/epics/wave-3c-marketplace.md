# Epic: Wave 3c — Marketplace

**Epic ID:** F33-W3c
**Wave:** 3 — Secondary Pages & Polish
**Size:** haiku
**Depends On:** Wave 2 (all)
**Status:** NOT STARTED

---

## Goal

Build the marketplace pages for P2P listings and business shops. Desktop's larger screen makes marketplace browsing and product detail viewing more effective with hover previews and multi-column layouts.

## Acceptance Criteria

1. Marketplace listing page: product cards in responsive grid (4 columns >1200px, 3 at 900-1200px, 2 at <900px); each card shows product image (1:1 ratio), title, price, seller name, and category tag
2. Product card hover: image crossfades to second product image (300ms, same pattern as discover cards), card lifts with `translateY(-2px)` and `var(--shadow-lg)`, price tag gets subtle copper glow
3. Product detail page: image gallery (main image 600px + thumbnail row below, click thumbnail to switch main), product info in `max-width: 720px` reading zone (title, price, description, seller info, "Köp" button)
4. Filter sidebar (context panel at >1200px, top bar at <1200px): category filter, price range slider, sort by (newest, price low-high, price high-low, popular), seller type (P2P, business)
5. Business shop page: header with shop logo + banner + name + description, product grid below, "Kontakta säljare" button
6. Search bar at top of marketplace with `/ ` keyboard shortcut to focus, autocomplete dropdown with product suggestions
7. P2P listing creation: form with photo upload (max 5, drag-and-drop reorder), title, description, price, category selector; preview button shows how listing will appear
8. All product images use Next.js `<Image>` with `loading="lazy"`, blurhash placeholders, and `sizes` attribute for responsive serving

## File Paths

- `apps/web/app/(app)/marketplace/page.tsx`
- `apps/web/app/(app)/marketplace/[id]/page.tsx`
- `apps/web/components/marketplace/ProductCard.tsx`
- `apps/web/components/marketplace/ProductCard.module.css`
- `apps/web/components/marketplace/ProductDetail.tsx`
- `apps/web/components/marketplace/ProductDetail.module.css`
- `apps/web/components/marketplace/ListingForm.tsx`

## Technical Notes

### Product Card CSS
```css
.productCard {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 300ms var(--spring), box-shadow 300ms var(--spring);
}
.productCard:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.productImage {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  position: relative;
}
.productImageSecondary {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 300ms ease;
}
.productCard:hover .productImageSecondary {
  opacity: 1;
}
.productInfo {
  padding: var(--space-4);
}
.productTitle {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}
.productPrice {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-copper);
}
.sellerName {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: var(--space-2);
}
```

### Image Gallery CSS
```css
.gallery {
  max-width: 600px;
}
.mainImage {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  object-fit: cover;
  box-shadow: var(--shadow-md);
}
.thumbnailRow {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
.thumbnail {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 200ms ease;
}
.thumbnail:hover {
  border-color: var(--border-medium);
}
.thumbnailActive {
  border-color: var(--color-copper);
}
```

### Price Range Slider
```css
.rangeSlider input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--border-subtle);
  outline: none;
}
.rangeSlider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-copper);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}
```

### RSC Strategy
- `marketplace/page.tsx` — Server Component: fetches product listings
- `marketplace/[id]/page.tsx` — Server Component: fetches product detail
- `ProductCard.tsx` — Client Component: hover interactions
- `ProductDetail.tsx` — Client Component: image gallery, buy action
- `ListingForm.tsx` — Client Component: form state, photo upload

## Definition of Done
- Marketplace grid displays products in responsive columns
- Product hover shows second image crossfade
- Product detail shows image gallery with thumbnails
- Filters update product listing
- Business shop page shows shop info + products
- P2P listing form with photo upload and drag-reorder
- Search with autocomplete works
- All product images lazy-loaded with blurhash
