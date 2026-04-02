# Epic: E04 — Upptäck Tiles Hub Screen

## Stitch Source
Convert: `html/upptack-hub.html`
Reference: `screenshots/stitch-reference/upptack-hub.png`

## Description
Build the Upptäck (Discover) tiles hub as the landing screen for the discover tab. Shows a 2-column masonry grid of 6 clickable tiles: Swipe (hero), Intentioner, Sök, Nära dig, Trending, Matchningar. Each tile navigates to its sub-view via stack navigation. Create a reusable TilesHub component for shared use with Community hub.

## Acceptance Criteria
1. Screen header: "Upptäck" in 20px extrabold Manrope with tight tracking
2. 2-column masonry grid with 16px gap
3. Hero tile (Swipe): full-width, aspect-ratio 4/3, image with overlay gradient + title
4. Standard tiles: aspect-square, white bg (surface-container-lowest), 40px icon circle + title + subtitle
5. Tile icons use 40px circle background (surface-container) with primary-container icon color
6. All tiles: rounded-lg (16px), polaroid-shadow, ghost border
7. Tapping any tile calls router.push to the corresponding sub-view
8. Screen uses PaperTextureBackground with 24px horizontal padding
9. Reusable TilesHub component accepts tile config array (icon, title, subtitle, route, hero flag)

## File Paths
- `packages/ui/src/TilesHub.tsx`
- `packages/ui/src/index.ts` (export)
- `apps/mobile/app/(tabs)/discover/index.tsx` (rewrite)
- `apps/mobile/app/(tabs)/discover/_layout.tsx` (update for stack nav)

## Design Tokens (from Stitch)
- Grid: 2 columns, 16px gap
- Hero tile: aspect-ratio 4/3, overlay gradient (black 0% → 60%)
- Standard tile: aspect-square, bg surface-container-lowest (#ffffff)
- Icon circle: 40px, bg surface-container (#faebe5), icon primary-container (#894D0D)
- Card radius: 16px (rounded-lg)
- Card shadow: 0 4px 12px rgba(33,26,23,0.08)
- Card border: 1px rgba(216,195,180,0.15)
- Screen padding: 24px horizontal
- Title: 16px bold Manrope, tight tracking
- Subtitle: 12px medium Manrope, on-surface-variant (#524439)
