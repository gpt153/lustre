# Epic: E07 — Community Tiles Hub Screen

## Stitch Source
Convert: `html/community-hub.html`
Reference: `screenshots/stitch-reference/community-hub.png`

## Description
Build the Community tiles hub as the landing screen for the community tab. Shows a 2-column masonry grid of 5 clickable tiles: Flöde (hero), Grupper, Event, Organisationer, Kudos. Each tile navigates to its sub-view. Reuses the TilesHub component created in E04.

## Acceptance Criteria
1. Screen header: "Community" in 20px extrabold Manrope
2. TilesHub component renders 5 tiles in 2-column masonry grid
3. Hero tile (Flöde): full-width, aspect-ratio 4/3, image overlay gradient
4. Standard tiles: Grupper, Event, Organisationer, Kudos with icon + title + subtitle
5. Tapping tiles navigates to sub-views via stack navigation
6. Grupper → existing groups screen, Event → existing events screen
7. Organisationer → existing orgs screen, Kudos → placeholder
8. Screen uses PaperTextureBackground with 24px horizontal padding
9. Community tab has its own _layout.tsx with Stack navigator

## File Paths
- `apps/mobile/app/(tabs)/community/_layout.tsx`
- `apps/mobile/app/(tabs)/community/index.tsx`
- `apps/mobile/app/(tabs)/community/feed.tsx` (placeholder for E08)
- `apps/mobile/app/(tabs)/community/groups.tsx`
- `apps/mobile/app/(tabs)/community/events.tsx`

## Design Tokens (from Stitch)
- Same as E04 TilesHub tokens
- Hero tile image: community/social themed
- Tile icons: Material — dynamic_feed (Flöde), group (Grupper), event (Event), corporate_fare (Organisationer), volunteer_activism (Kudos)
- Icon circle: 40px, bg surface-container (#faebe5)
