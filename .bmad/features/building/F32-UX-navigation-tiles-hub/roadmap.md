# Roadmap — F32: Navigation Tiles Hub System

## Overview

Replace the broken 5-tab + 10 hidden routes navigation with a clean 5-tab bottom nav bar using a tiles-hub pattern for Upptäck and Community. Center FAB for quick-create actions. All sub-views via stack navigation within tabs.

**Total waves:** 4
**Total epics:** 10
**Stitch project:** `15975770183721364552`
**Stitch reference:** `screenshots/stitch-reference/`

---

## Wave 1: Foundation — Bottom Nav Bar + Tab Layout

**Status:** DONE — 2026-03-31

**Visual Verification:**
- Screenshots: screenshots/wave1/run4/
- Comparison: screenshots/wave1/run4/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 4 (run1 = first attempt, run4 = final pass)

**Goal:** Replace the current broken PolaroidTabBar with a new 5-tab BottomNavBar + center FAB. All 5 tabs render placeholder screens. Navigation structure is correct.

**Epics:**
- E01: Bottom Nav Bar Component (`epics/E01-bottom-nav-bar.md`)
- E02: Tab Layout Rewrite (`epics/E02-tab-layout-rewrite.md`)
- E03: Center FAB Button (`epics/E03-center-fab.md`)

**Stitch source:** `html/bottom-nav-spec.html`, `bottom-nav-spec.png`

**Testgate:**
- [x] 5 tab icons visible: Upptäck, Community, FAB, Chatt, Jag
- [x] Tapping each tab switches content (placeholder screens OK)
- [x] Active tab shows copper (#894D0D) icon + dot indicator
- [x] Inactive tabs show outline (#857467) color
- [x] Center FAB elevated above nav bar with copper gradient
- [x] FAB has white 4px border and fab-shadow
- [x] Nav bar has rounded top corners (24px), nav-shadow upward
- [x] Nav bar uses glassmorphism (BlurView iOS, solid fallback Android)
- [x] No hidden routes visible in the tab bar
- [x] `~/bin/verify-wave-screenshots.sh F32-UX-navigation-tiles-hub 1`

---

## Wave 2: Upptäck Hub + Sub-navigation

**Status:** DONE — 2026-03-31

**Visual Verification:**
- Screenshots: screenshots/wave2/run1/
- Comparison: screenshots/wave2/run1/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 1 (run1 = first attempt, run1 = final pass)

**Goal:** Upptäck tab shows tiles hub with 6 tiles. Tapping a tile navigates to its sub-view via stack navigation. Swipe and Intentions sub-views are fully functional.

**Epics:**
- E04: Upptäck Tiles Hub Screen (`epics/E04-upptack-hub.md`)
- E05: Swipe Sub-view (`epics/E05-swipe-view.md`)
- E06: Intentions Sub-view (`epics/E06-intentions-view.md`)

**Stitch source:** `html/upptack-hub.html`, `html/swipe-view.html`, `html/intentions-view.html`, `upptack-hub.png`, `swipe-view.png`, `intentions-view.png`

**Testgate:**
- [x] Upptäck hub shows 6 tiles in 2-column masonry grid
- [x] Hero tile (Swipe) is full-width with image overlay gradient
- [x] Standard tiles show icon circle + title + subtitle
- [x] Tapping "Swipe" tile navigates to swipe card deck
- [x] Swipe view shows Polaroid card with 5 action buttons
- [x] Tapping "Intentioner" tile shows intentions filter pills + cards
- [x] Back arrow from sub-views returns to hub
- [x] Tiles have polaroid-shadow and rounded-lg corners
- [x] Screen padding 24px horizontal
- [x] `~/bin/verify-wave-screenshots.sh F32-UX-navigation-tiles-hub 2`

---

## Wave 3: Community Hub + Feed

**Goal:** Community tab shows tiles hub with 5 tiles. Flöde (feed) sub-view shows vertical Polaroid posts. Quick Create bottom sheet functional.

**Epics:**
- E07: Community Tiles Hub Screen (`epics/E07-community-hub.md`)
- E08: Flöde Feed Sub-view (`epics/E08-flode-feed.md`)
- E09: Quick Create Bottom Sheet (`epics/E09-quick-create.md`)

**Stitch source:** `html/community-hub.html`, `html/flode-feed.html`, `html/quick-create.html`, `community-hub.png`, `flode-feed.png`, `quick-create.png`

**Testgate:**
- [ ] Community hub shows 5 tiles in 2-column masonry grid
- [ ] Hero tile (Flöde) is full-width with image overlay
- [ ] Tapping "Flöde" navigates to vertical Polaroid post feed
- [ ] Feed posts show white card, inner photo, optional washi tape, slight rotation
- [ ] Engagement row: heart + comment + bookmark icons
- [ ] Center FAB tap opens bottom sheet with 6 quick-create actions
- [ ] Bottom sheet has dark overlay (bg-black/40) + backdrop blur
- [ ] 2-column grid of action buttons with 56px circle icons
- [ ] FAB rotates 45° to X when sheet is open
- [ ] `~/bin/verify-wave-screenshots.sh F32-UX-navigation-tiles-hub 3`

---

## Wave 4: Chatt + Jag + Final Polish

**Goal:** Chatt and Jag tabs are fully functional. All navigation flows work end-to-end. Visual polish pass.

**Epics:**
- E10: Chatt Screen (`epics/E10-chatt.md`)
- E11: Jag Profile Screen (`epics/E11-jag-profil.md`)

**Stitch source:** `html/chatt.html`, `html/jag-profil.html`, `chatt.png`, `jag-profil.png`

**Testgate:**
- [ ] Chatt tab shows "Nya matchningar" horizontal avatar scroll (56px, copper ring)
- [ ] Chatt shows "Konversationer" vertical list with 48px avatars
- [ ] Unread badge: primary-container bg, white text, 20px circle
- [ ] Tapping conversation opens chat room
- [ ] Jag tab shows 96px avatar with copper ring + verified badge
- [ ] Name, age, location centered below avatar
- [ ] Stats row with 3 stats and dividers
- [ ] Posts grid: 3-column Polaroid thumbnails
- [ ] All 5 tabs navigate correctly, no regressions
- [ ] `~/bin/verify-wave-screenshots.sh F32-UX-navigation-tiles-hub 4`

---

## File Impact Summary

### Files to Rewrite
| File | Wave | Notes |
|------|------|-------|
| `apps/mobile/app/(tabs)/_layout.tsx` | W1 | Complete rewrite — new 5-tab structure |
| `apps/mobile/app/(tabs)/discover/index.tsx` | W2 | Tiles hub replaces current discover |
| `apps/mobile/app/(tabs)/profile/index.tsx` | W4 | Jag profile page |

### New Files
| File | Wave | Notes |
|------|------|-------|
| `packages/ui/src/BottomNavBar.tsx` | W1 | Shared bottom nav component |
| `packages/ui/src/CenterFAB.tsx` | W1 | Center action button |
| `packages/ui/src/TilesHub.tsx` | W2 | Reusable tiles hub grid |
| `apps/mobile/app/(tabs)/discover/swipe.tsx` | W2 | Swipe card deck sub-view |
| `apps/mobile/app/(tabs)/discover/intentions.tsx` | W2 | Intentions filter + cards |
| `apps/mobile/app/(tabs)/community/_layout.tsx` | W3 | Community tab stack layout |
| `apps/mobile/app/(tabs)/community/index.tsx` | W3 | Community tiles hub |
| `apps/mobile/app/(tabs)/community/feed.tsx` | W3 | Flöde feed sub-view |
| `packages/ui/src/QuickCreateMenu.tsx` | W3 | Bottom sheet quick-create |
| `apps/mobile/app/(tabs)/chat/index.tsx` | W4 | Rewritten chat list |

### Existing Routes to Remove/Reorganize
- `(tabs)/explore` → becomes sub-view under discover hub
- `(tabs)/learn` → PAUSED, remove from tabs entirely
- `(tabs)/connect` → replaced by `(tabs)/chat`
- `(tabs)/events.tsx`, `groups.tsx`, `orgs.tsx`, `safedate.tsx` → sub-views under hubs or stack screens
- `(tabs)/coach`, `(tabs)/consent`, `(tabs)/shop` → stack screens accessible from Jag profile

---

## Design Tokens Reference (from Stitch)

```
primary:              #6a3800
primary-container:    #894D0D    (active tab, icons, buttons)
surface:              #fff8f6    (main background)
surface-container:    #faebe5    (card/tile backgrounds)
on-surface:           #211a17    (primary text)
outline:              #857467    (inactive icons)
outline-variant:      #d8c3b4    (borders, dividers)
copper-glow:          linear-gradient(135deg, #894D0D, #8C4F10)
nav-shadow:           0 -8px 24px rgba(33,26,23,0.06)
fab-shadow:           0 8px 24px rgba(137,77,13,0.3)
polaroid-shadow:      0 4px 12px rgba(33,26,23,0.08)
Bottom nav height:    80px
Center FAB size:      56px
FAB elevation:        -24px
Tab icon size:        24px
Screen padding:       24px horizontal
Tile grid gap:        16px
Font:                 Manrope (all weights)
```
