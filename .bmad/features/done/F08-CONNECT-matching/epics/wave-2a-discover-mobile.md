# Epic: wave-2a-discover-mobile

**Model:** haiku
**Wave:** 2
**Group:** A (parallel with 2b)

## Description

Build the mobile discover experience: swipe card UI, match animation, search screen with filters, and matches list. Replace the placeholder discover tab.

## Acceptance Criteria

1. `packages/app/src/hooks/useDiscovery.ts` exists — exports `useDiscovery` hook wrapping `trpc.match.getDiscoveryStack.useQuery`, `trpc.match.swipe.useMutation`, `trpc.match.getMatches.useQuery`, `trpc.match.search.useQuery`
2. `packages/app/src/screens/DiscoverScreen.tsx` exists — shows swipeable profile cards using a swipe gesture handler (PanResponder or react-native-gesture-handler). Each card shows the profile photo, displayName, age, bio preview. Right swipe = LIKE, left swipe = PASS. Calls `match.swipe` mutation on swipe.
3. `packages/app/src/screens/MatchesListScreen.tsx` exists — FlatList of matched profiles with photo, displayName, age. Tappable (calls `onMatchPress` prop).
4. `packages/app/src/screens/SearchScreen.tsx` exists — filter controls (gender multi-select, age range slider, orientation, seeking, radius) with a results list below. Uses `match.search` query.
5. `packages/app/src/components/MatchAnimation.tsx` exists — overlay shown when a mutual match occurs (confetti or highlight effect, shows matched profile photo and name, dismiss button)
6. `apps/mobile/app/(tabs)/discover.tsx` updated — replaces placeholder with DiscoverScreen, includes tab navigation to SearchScreen and MatchesListScreen
7. `packages/app/src/index.ts` updated — exports new screens and hooks
8. All components use Tamagui (YStack, XStack, Text, Button, etc.) and follow existing patterns

## File Paths

- `packages/app/src/hooks/useDiscovery.ts` (new)
- `packages/app/src/screens/DiscoverScreen.tsx` (new)
- `packages/app/src/screens/MatchesListScreen.tsx` (new)
- `packages/app/src/screens/SearchScreen.tsx` (new)
- `packages/app/src/components/MatchAnimation.tsx` (new)
- `apps/mobile/app/(tabs)/discover.tsx` (edit)
- `packages/app/src/index.ts` (edit)
