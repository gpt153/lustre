# Epic: Wave 2a — Discover Grid

**Epic ID:** F33-W2a
**Wave:** 2 — Core Pages
**Size:** haiku
**Depends On:** Wave 1 (all)
**Status:** VERIFIED

---

## Goal

Build the discover page with a grid layout optimized for desktop. Hover previews, keyboard navigation, and context panel integration replace the mobile swipe-stack pattern.

## Acceptance Criteria

1. Profile cards displayed in responsive grid: 4 columns at >1200px, 3 columns at 900-1200px, 2 columns at <900px; cards have 3:4 aspect ratio with `border-radius: 16px`
2. Card hover (300ms) crossfades from primary photo to secondary photo using CSS `opacity` transition, and reveals info overlay (name, age, prompt snippet) sliding up from bottom with `--spring` easing
3. Card click opens full profile in context panel (right side) without leaving the grid; if context panel is hidden (tablet/mobile), profile opens as a full-page route
4. Keyboard navigation: arrow keys move a visible focus ring between cards (2px copper outline, offset 4px), `L` likes, `P` passes, `S` super-likes, `Enter` opens profile
5. Filter sidebar (sticky, top of context panel at >1200px, or top sheet at <1200px) with toggles for: distance, age range, mode (vanilla/spicy), interests; filters update grid in real-time via shared `useMatchStore`
6. Infinite scroll: loads next 20 profiles when scrolled within 200px of bottom, uses `IntersectionObserver`, shows skeleton grid during load
7. Like/pass actions trigger visual feedback: liked card briefly flashes copper glow (`box-shadow: 0 0 20px rgba(184, 115, 51, 0.3)`) then fades out; passed card fades to `opacity: 0.5` then removes
8. Images use Next.js `<Image>` with blurhash placeholder, `loading="lazy"` except first 8 cards which use `priority`

## File Paths

- `apps/web/app/(app)/discover/page.tsx`
- `apps/web/components/discover/DiscoverGrid.tsx`
- `apps/web/components/discover/DiscoverGrid.module.css`
- `apps/web/components/discover/ProfileCard.tsx`
- `apps/web/components/discover/ProfileCard.module.css`
- `apps/web/components/discover/FilterSidebar.tsx`
- `apps/web/hooks/useDiscoverKeyboard.ts`

## Technical Notes

### Grid CSS
```css
.grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(4, 1fr);
  padding: var(--space-4);
}
@media (max-width: 1200px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
```

### Profile Card Hover
```css
.card {
  aspect-ratio: 3 / 4;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: box-shadow 300ms var(--spring), transform 300ms var(--spring);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.photoPrimary, .photoSecondary {
  position: absolute;
  inset: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
}
.photoSecondary {
  opacity: 0;
  transition: opacity 300ms ease;
}
.card:hover .photoSecondary {
  opacity: 1;
}
.infoOverlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-4);
  background: linear-gradient(transparent, rgba(44, 36, 33, 0.7));
  color: white;
  transform: translateY(100%);
  transition: transform 300ms var(--spring);
}
.card:hover .infoOverlay {
  transform: translateY(0);
}
.nameAge {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
}
.prompt {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### Like Feedback Animation
```css
@keyframes likeGlow {
  0% { box-shadow: 0 0 0 rgba(184, 115, 51, 0); }
  30% { box-shadow: 0 0 20px rgba(184, 115, 51, 0.3); }
  100% { box-shadow: 0 0 0 rgba(184, 115, 51, 0); opacity: 0; transform: scale(0.95); }
}
.cardLiked {
  animation: likeGlow 600ms var(--ease-out-expo) forwards;
}
```

### Keyboard Navigation Focus
```css
.card:focus-visible {
  outline: 2px solid var(--color-copper);
  outline-offset: 4px;
}
.cardFocused {
  outline: 2px solid var(--color-copper);
  outline-offset: 4px;
}
```

### RSC Strategy
- `page.tsx` — Server Component: fetches initial profiles via `createCaller`, renders `<DiscoverGrid initialProfiles={...} />`
- `DiscoverGrid.tsx` — Client Component: handles hover, keyboard, infinite scroll
- `ProfileCard.tsx` — Client Component: hover state, like/pass actions
- `FilterSidebar.tsx` — Client Component: filter state

## Definition of Done
- Grid displays profiles in correct column count per breakpoint
- Hover shows second image crossfade and info overlay
- Click opens profile in context panel
- Keyboard shortcuts (L, P, S, arrows, Enter) all functional
- Infinite scroll loads more profiles
- Like/pass feedback animations play
- First 8 images load eagerly, rest lazy-loaded
- Works correctly at all 5 responsive breakpoints
