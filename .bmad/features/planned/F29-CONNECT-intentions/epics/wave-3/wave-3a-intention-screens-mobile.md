# Epic: wave-3a-intention-screens-mobile

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3b)

## Description

Build the mobile UI for the Intentions system: Intention creation form, Intention list (My Intentions dashboard), per-Intention feed screen with intent-first profile cards. Integrate into the Discover tab with mode-aware tab switching (Spicy = Intentions default, Vanilla = Swipe default).

## Acceptance Criteria

1. `CreateIntentionScreen` in `packages/app/src/screens/CreateIntentionScreen.tsx` — form with all Intention fields. Kink multi-select only visible in Spicy mode. Validates max 3 active. Submit creates Intention via tRPC.
2. `IntentionListScreen` in `packages/app/src/screens/IntentionListScreen.tsx` — shows user's Intentions with status badges (Active/Paused/Expired), days remaining, and pause/resume/delete actions. "Create new" button (disabled if 3 active).
3. `IntentionFeedScreen` in `packages/app/src/screens/IntentionFeedScreen.tsx` — per-Intention feed with intent-first cards: compatibility score badge, matched tags, bio snippet shown ABOVE the profile photo. Tap to expand full profile. Infinite scroll pagination.
4. `IntentionProfileCard` component in `packages/app/src/components/IntentionProfileCard.tsx` — card layout: compatibility % badge (top), matched intention tags, bio snippet, then photo (below fold).
5. `useIntentions` hook in `packages/app/src/hooks/useIntentions.ts` — wraps tRPC calls for all Intention operations.
6. Discover tab (`apps/mobile/app/(tabs)/discover.tsx`) updated with sub-tabs: in Spicy mode [Intentions | Swipe | Search], in Vanilla mode [Swipe | Intentions | Search].
7. Fallback results (cold-start) shown with a subtle "Suggested" label to distinguish from intention-matched results.

## File Paths

- `packages/app/src/screens/CreateIntentionScreen.tsx`
- `packages/app/src/screens/IntentionListScreen.tsx`
- `packages/app/src/screens/IntentionFeedScreen.tsx`
- `packages/app/src/components/IntentionProfileCard.tsx`
- `packages/app/src/hooks/useIntentions.ts`
- `apps/mobile/app/(tabs)/discover.tsx` (update sub-tabs)
