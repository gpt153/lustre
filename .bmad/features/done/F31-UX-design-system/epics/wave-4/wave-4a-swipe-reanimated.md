# Epic: wave-4a-swipe-reanimated

**Model:** sonnet
**Wave:** 4
**Group:** A (sequential — must complete before 4b)

## Description

Rewrite the DiscoverScreen swipe card mechanics using React Native Reanimated 3 and Gesture Handler. Replace the legacy `Animated.ValueXY` implementation with worklet-based animations running on the UI thread. Cards become fullscreen-style (90% width, 75% height) with photo covering the entire card and a gradient overlay from bottom showing name/age/distance. Implement spring physics for snap-back and fly-off, Like/Nope stamp overlays with glow, and visible stacked cards behind the current card.

**Justification for sonnet:** This epic involves complex gesture math (pan + rotation interpolation), Reanimated worklet constraints, and performance-critical code that must run at 60fps. The interaction between gesture state, animated values, and conditional stamp rendering requires careful architecture.

## Acceptance Criteria

1. `DiscoverScreen` uses `useAnimatedGestureHandler` (or Gesture Handler v2 `Gesture.Pan()`) instead of `PanResponder`/`Animated.ValueXY`. All animation logic runs in worklets (UI thread).
2. Card dimensions: 90% of screen width, 75% of screen height. Photo fills the entire card with `resizeMode: 'cover'`. `borderRadius: 16`, `overflow: 'hidden'`.
3. Gradient overlay: `LinearGradient` from transparent (top 60%) to `rgba(44,36,33,0.8)` (bottom 40%). Name (20px, $heading, white), age, and distance rendered over gradient.
4. Swipe rotation: `interpolate(translateX, [-screenWidth, 0, screenWidth], [-15, 0, 15])` degrees.
5. Like stamp (right swipe): green "LIKE" text at -15deg rotation, opacity interpolated from translateX, with outer glow (`textShadowColor: '#7A9E7E', textShadowRadius: 10`). Nope stamp (left swipe): red "NOPE" text at 15deg rotation with ember glow.
6. Snap-back: `withSpring(0, { damping: 20, stiffness: 90 })` for both translateX and translateY when swipe doesn't exceed threshold (100px offset or 500px/s velocity).
7. Fly-off: `withTiming(targetX, { duration: 200 })` when threshold exceeded, followed by card removal callback via `runOnJS`.
8. Stacked cards: 2 cards visible behind current card. Card at index+1: `scale: 0.95`, `translateY: 10`. Card at index+2: `scale: 0.90`, `translateY: 20`. Both animate up smoothly when top card is removed.
9. Like/Pass action buttons below card: circles (56px) with copper (#B87333) border. Like button: heart icon, gold (#D4A843) fill on press. Pass button: X icon, ember fill on press.
10. No references to `Animated.ValueXY`, `Animated.event`, or `PanResponder` remain in DiscoverScreen.

## File Paths

- `packages/app/src/screens/DiscoverScreen.tsx`
- `packages/app/src/components/SwipeCard.tsx` (new — extracted card component)
- `packages/app/src/components/SwipeStamp.tsx` (new — Like/Nope overlay)
- `packages/app/src/hooks/useSwipeGesture.ts` (new — Reanimated gesture hook)
- `apps/mobile/babel.config.js` (add reanimated plugin if not present)
