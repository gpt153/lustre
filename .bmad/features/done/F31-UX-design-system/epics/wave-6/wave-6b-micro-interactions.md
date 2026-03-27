# Epic: wave-6b-micro-interactions

**Model:** haiku
**Wave:** 6
**Group:** A (parallel with 6a)

## Description

Add spring-physics micro-interactions throughout the app: button press animations, list item press feedback, pull-to-refresh with copper-themed spinner, and navigation transitions. Add haptic feedback on key user actions (like, match, send message).

## Acceptance Criteria

1. All `LustreButton` presses trigger haptic feedback: `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on regular buttons, `Medium` on primary CTAs.
2. List item press: scale to 0.98 with `withSpring({ damping: 15, stiffness: 150 })`, background briefly tints to copperLight (100ms).
3. Pull-to-refresh indicator uses copper color (#B87333) instead of default system color.
4. Tab bar icons: active icon animates with subtle scale bounce (1.0 -> 1.15 -> 1.0) using spring on tab switch.
5. Like action (heart icon): heart scales to 1.3 then back to 1.0 with spring + light haptic.
6. Send message: light haptic on send button press.
7. All animations use Reanimated (not legacy Animated API) and run on UI thread.

## File Paths

- `packages/ui/src/LustreButton.tsx`
- `packages/app/src/components/LikeButton.tsx`
- `packages/app/src/hooks/useHaptics.ts`
- `packages/app/src/hooks/usePressAnimation.ts` (new — reusable press animation hook)
