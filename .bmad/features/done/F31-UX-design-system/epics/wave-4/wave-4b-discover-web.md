# Epic: wave-4b-discover-web

**Model:** haiku
**Wave:** 4
**Group:** A (sequential — after 4a for shared component consistency)

## Description

Update the web discover page to match the new card design. Profile images get gradient overlays, action buttons use copper/gold styling, and the overall page uses warm backgrounds. The web version uses click-based Like/Pass (not drag swipe) with the same visual language as mobile.

## Acceptance Criteria

1. Web discover page background uses warmWhite (#FDF8F3) in light mode, #1A1614 in dark mode.
2. Profile cards show photo with CSS gradient overlay (`linear-gradient(transparent 60%, rgba(44,36,33,0.8) 100%)`), name/age/distance in white over the gradient.
3. Like button: circle with copper border, heart icon, gold fill on hover. Pass button: circle with copper border, X icon, ember fill on hover.
4. Cards use borderRadius 16, copper-tinted box-shadow, no borders.
5. Matches and search sub-pages updated to use warm color scheme (copper accents, warm backgrounds).
6. All #E91E63 references removed from web discover pages.
7. Responsive layout: single card centered on mobile widths, grid on desktop.

## File Paths

- `apps/web/app/(app)/discover/page.tsx`
- `apps/web/app/(app)/discover/matches/page.tsx`
- `apps/web/app/(app)/discover/search/page.tsx`
