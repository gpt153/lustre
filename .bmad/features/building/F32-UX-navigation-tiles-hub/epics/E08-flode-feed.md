# Epic: E08 — Flöde Feed Sub-view

## Stitch Source
Convert: `html/flode-feed.html`
Reference: `screenshots/stitch-reference/flode-feed.png`

## Description
Build the Flöde (feed) sub-view accessible from the Community hub. Shows a vertical scroll of Polaroid-style posts with engagement actions. Reuse existing FeedScreen/PostCard components and useFeed hook, restyled to match Stitch design with Polaroid post cards.

## Acceptance Criteria
1. Screen header with back arrow + "Flöde" title
2. Vertical FlatList of Polaroid post cards
3. Post card: white bg (surface-container-lowest), 12px padding, larger bottom padding
4. Inner photo: aspect-square or 4/5, rounded-sm corners
5. Optional washi tape decoration at top center of photo
6. Slight card rotation (rotate-1 or -rotate-2, alternating)
7. Caption in italic Manrope, primary color (#6a3800)
8. Engagement row below caption: heart + comment + bookmark icons
9. Post author: PolaroidAvatar + display name + timestamp
10. Infinite scroll with cursor-based pagination via useFeed hook

## File Paths
- `apps/mobile/app/(tabs)/community/feed.tsx`
- `packages/ui/src/PolaroidCard.tsx` (reuse)

## Design Tokens (from Stitch)
- Card bg: surface-container-lowest (#ffffff)
- Card padding: 12px, bottom 24px
- Card radius: 16px
- Card shadow: polaroid-shadow (0 4px 12px rgba(33,26,23,0.08))
- Card border: 1px rgba(216,195,180,0.15)
- Photo radius: 4px (rounded-sm)
- Caption: 18px italic Manrope, color primary (#6a3800)
- Engagement icons: 24px, outline color (#857467), active primary-container (#894D0D)
- Card rotation: alternating ±1-2 degrees
- Author avatar: 32px PolaroidAvatar
