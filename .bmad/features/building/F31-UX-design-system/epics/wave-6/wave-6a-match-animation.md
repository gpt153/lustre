# Epic: wave-6a-match-animation

**Model:** haiku
**Wave:** 6
**Group:** A (parallel with 6b)

## Description

Replace the basic scale/opacity match animation with a premium Lottie animation featuring copper/gold brand colors, haptic feedback, and a shimmer effect. Create or integrate a Lottie JSON file with the match celebration animation.

## Acceptance Criteria

1. `MatchAnimation` component uses `lottie-react-native` to play a celebration animation on match.
2. Lottie JSON file exists at `packages/app/src/assets/animations/match-celebration.json` with copper (#B87333) and gold (#D4A843) themed particles/confetti.
3. Haptic feedback fires on match reveal: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` (expo-haptics).
4. A copper shimmer effect overlays the matched profile photos (animated gradient sweep from left to right, 1 second duration).
5. Animation sequence: backdrop fade-in (200ms) -> Lottie plays (1.5s) + haptic fires -> shimmer on photos (1s) -> "It's a Match!" text fades in ($heading font, gold color).
6. Dismiss: tap anywhere or auto-dismiss after 4 seconds with fade-out.
7. Fallback: if Lottie fails to load, fall back to simple scale animation (current behavior) so the match is never blocked.

## File Paths

- `packages/app/src/components/MatchAnimation.tsx`
- `packages/app/src/assets/animations/match-celebration.json` (new)
- `packages/app/src/hooks/useHaptics.ts` (new — shared haptics utility)
