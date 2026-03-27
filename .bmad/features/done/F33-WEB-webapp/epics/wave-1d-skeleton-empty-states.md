# Epic: Wave 1d — Skeleton Loaders & Empty States

**Epic ID:** F33-W1d
**Wave:** 1 — Design Foundation
**Size:** haiku
**Depends On:** W1a (CSS tokens), W1c (core components)
**Status:** VERIFIED

---

## Goal

Build skeleton loading components and empty state illustrations that maintain the warm UI feeling during loading and zero-data states. Skeletons use copper-tinted shimmer, empty states use warm illustrations with clear CTAs.

## Acceptance Criteria

1. Skeleton base component with copper-tinted shimmer animation: `linear-gradient` from `rgba(184, 115, 51, 0.08)` to `rgba(184, 115, 51, 0.15)` back, 1.5s duration, infinite, `background-size: 200% 100%`
2. SkeletonCard component matching Card dimensions (border-radius 16px) with image placeholder (3:4 ratio), two text line placeholders (80% and 60% width), and action button placeholder
3. SkeletonChatMessage component with avatar circle (40px), message bubble (varying widths 40-80%), and timestamp line
4. SkeletonProfileGrid component rendering 8 skeleton cards in the discover grid layout (4 columns at >1200px, 3 at 900-1200px, 2 at <900px)
5. EmptyState component with: illustration area (120x120px), title (text-section style), description (text-body), optional CTA button (primary variant)
6. Specific empty states: "No matches yet" (discover), "Start a conversation" (chat), "No posts yet" (feed), "No events nearby" (events) — each with distinct warm-toned SVG illustration placeholder
7. Skeleton shimmer animation respects `prefers-reduced-motion` — falls back to static `opacity: 0.6` background without animation
8. All skeletons use `aria-hidden="true"` and parent container has `aria-busy="true"` and `aria-label` describing what's loading

## File Paths

- `apps/web/components/common/Skeleton.tsx`
- `apps/web/components/common/Skeleton.module.css`
- `apps/web/components/common/EmptyState.tsx`
- `apps/web/components/common/EmptyState.module.css`
- `apps/web/components/discover/SkeletonProfileGrid.tsx`
- `apps/web/components/chat/SkeletonChatMessage.tsx`

## Technical Notes

### Skeleton Shimmer CSS
```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(184, 115, 51, 0.08) 0%,
    rgba(184, 115, 51, 0.15) 50%,
    rgba(184, 115, 51, 0.08) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: rgba(184, 115, 51, 0.1);
    opacity: 0.6;
  }
}
```

### Dark Mode Skeleton
```css
:root[data-theme="dark"] .skeleton {
  background: linear-gradient(
    90deg,
    rgba(212, 168, 67, 0.06) 0%,
    rgba(212, 168, 67, 0.12) 50%,
    rgba(212, 168, 67, 0.06) 100%
  );
  background-size: 200% 100%;
}
```

### Empty State Layout
```css
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-16) var(--space-8);
  gap: var(--space-4);
}
.illustration {
  width: 120px;
  height: 120px;
  opacity: 0.7;
}
.title {
  font-family: var(--font-heading);
  font-size: 28px;
  line-height: 36px;
  font-weight: 500;
  color: var(--text-primary);
}
.description {
  font-size: 15px;
  line-height: 24px;
  color: var(--text-muted);
  max-width: 400px;
}
```

### RSC Boundaries
- `Skeleton` — Server Component (pure CSS, no interactivity)
- `EmptyState` — Server Component (static content, CTA button is passed as child)

## Definition of Done
- Skeleton shimmer animates smoothly at 60fps
- Skeletons match the dimensions of their real component counterparts
- Empty states display centered with warm illustration, title, description, CTA
- Dark mode skeletons use gold-tinted shimmer instead of copper
- Reduced motion shows static skeleton without shimmer
- Accessibility attributes correctly applied
