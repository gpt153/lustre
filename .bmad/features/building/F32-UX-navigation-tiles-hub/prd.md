# PRD — F32: Navigation Tiles Hub System

## Overview

Replace the current broken bottom navigation with a complete tiles-hub navigation system. The current tab bar has a bug where hidden routes still render, making navigation unusable. This feature rebuilds navigation from scratch using a 5-tab bottom bar with tiles-hub pattern for Discover and Community tabs.

## Problem

- Current PolaroidTabBar renders hidden routes (`href: null`) in the tab bar, shifting all tab positions
- Tab positions don't match visual labels — tapping "Discover" opens wrong content
- No center action button for quick-create flows
- No sub-navigation within tabs (all features crammed into flat tab list)
- 10+ hidden routes polluting the tab bar

## Solution

### 5-Tab Bottom Navigation

| Tab | Icon | Name | Content |
|-----|------|------|---------|
| 1 | explore | Upptäck | Tiles hub → Swipe, Intentions, Sök, Nära dig, Trending |
| 2 | group | Community | Tiles hub → Flöde, Grupper, Event, Organisationer, Kudos |
| 3 | add (FAB) | — | Quick-create bottom sheet overlay |
| 4 | chat_bubble | Chatt | Conversation list with match row |
| 5 | person | Jag | Profile page ("min sida") |

### Tiles Hub Pattern

Both Upptäck and Community use a masonry-grid of clickable tile cards as their landing page. Each tile navigates to a dedicated sub-view via stack navigation. Back arrow returns to the hub.

### Center Action Button (FAB)

Floating copper gradient button elevated above the nav bar. Tap opens a bottom sheet with 6 quick-create actions: Nytt inlägg, Nytt meddelande, Skapa event, Ny grupp, SafeDate, Uppdatera intentioner.

### Sub-Views

- **Swipe:** Polaroid card deck with 5 action buttons (rewind, pass, super-like, like, boost)
- **Intentions:** Horizontal filter pills (Alla/Dejt/Relation/Vänskap/Öppet/Event) + filtered card stack
- **Flöde:** Vertical scroll of Polaroid-style posts with engagement
- Other sub-views (Sök, Nära dig, Grupper, Event, Organisationer) use existing screens

## Design Reference

Stitch Project: `15975770183721364552` — "Lustre Navigation — Tiles Hub System"
9 screens with full HTML + PNG reference.
Design tokens and analysis: `stitch-analysis.md`

## Technical Approach

- Platform: React Native (Expo Router)
- Replace existing `(tabs)/_layout.tsx` with new tab navigator
- Custom BottomNavBar component (not default Expo tab bar)
- Stack navigation within each tab for sub-views
- Bottom sheet for center action (react-native-bottom-sheet or custom modal)
- Reuse existing PolaroidCard, PaperTextureBackground components
- Material icons via @expo/vector-icons

## Success Criteria

1. 5 tabs visible and tappable — no hidden routes in nav bar
2. Correct tab highlights when active
3. Center FAB elevated and opens quick-create menu
4. Upptäck hub shows 6 tiles, each navigating to sub-view
5. Community hub shows 5 tiles, each navigating to sub-view
6. Back navigation works from all sub-views
7. Chatt shows match row + conversation list
8. Jag shows profile with stats, posts, collections
9. Visual match with Stitch reference designs
10. No regression in existing functionality
