# Epic: wave-3c-mode-switching

**Model:** haiku
**Wave:** 3
**Group:** B (sequential — after 3a and 3b)

## Description

Wire up the Vanilla/Spicy mode field visibility on the Intentions screens for both mobile and web. Intentions is the primary/default tab in BOTH modes — the difference is which fields are available. In Vanilla mode, kink and relationship-structure fields are hidden. In Spicy mode, all fields are visible. Ensure that mode changes properly re-render the Intention form and feed without data loss.

## Acceptance Criteria

1. On mobile Discover tab: Intentions sub-tab is selected by default on mount in BOTH Vanilla and Spicy mode. Swipe is a secondary tab in both modes.
2. On web Discover page: same — Intentions is default in both modes.
3. When user switches mode (via profile settings), the discover screen re-renders and Intentions remains the active tab.
4. Kink fields in CreateIntentionScreen: visible and functional in Spicy mode, completely hidden (not just disabled) in Vanilla mode.
5. RelationshipStructure field: hidden in Vanilla mode, visible in Spicy mode.
6. IntentionKinkTag data: when a Spicy-mode user with kink tags on an Intention switches to Vanilla mode, kink tags are preserved in DB but hidden from UI. Switching back to Spicy reveals them again.
7. Mode detection uses the existing contentPreference field from the user's profile store.

## File Paths

- `apps/mobile/app/(tabs)/discover.tsx`
- `apps/web/app/(app)/discover/page.tsx`
- `packages/app/src/screens/CreateIntentionScreen.tsx` (kink field visibility)
- `packages/app/src/stores/profileStore.ts` (read contentPreference)
