# Epic: Wave 3a — Micro-interactions (Reanimated + Gesture Handler)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 3 (Polish & Delight)
**Model:** haiku
**Estimate:** 3 days
**Dependencies:** Wave 2 complete

---

## Summary

Add subtle, consistent micro-interactions to every interactive element in the mobile app. All Pressables get Reanimated `withSpring` press animation. Gesture Handler enables long-press context menus and double-tap to like. FlashList items get LayoutAnimation staggered entrance. Tab switches get spring-animated underline. Every touch point feels alive and responsive.

## Acceptance Criteria

1. AnimatedPressable component: Reanimated scale to 0.97 on press via `withSpring({ damping: 25, stiffness: 200, mass: 0.8 })`, springs back to 1.0 on release with slight overshoot (spring naturally overshoots), Expo Haptics `impactLight` on press — replaces all raw Pressable/TouchableOpacity usage
2. Card press: translateY -2 + shadow elevation increase (SHADOWS.sm to SHADOWS.md) via Reanimated `useAnimatedStyle`, 150ms spring — applied to all CardBase instances
3. List item entrance: Reanimated staggered fade-in + translateY (20px to 0) using `withDelay(index * 50, withSpring(0, SPRING.default))` on item mount — applied to FlashList renderItem wrapper
4. Tab switch: active tab copper underline slides to new position via Reanimated shared value driven by `onLayout` measured positions, `withSpring({ damping: 20, stiffness: 130, mass: 0.9 })` — inactive tabs dim to 60% opacity via `withTiming`
5. `Gesture.LongPress({ minDuration: 400 })` on profile photos: shows native-feel context menu (save photo, report) via custom bottom sheet, Expo Haptics `impactMedium` on activation
6. `Gesture.Tap({ numberOfTaps: 2 })` on feed posts: triggers like with heart animation overlay (copper Heart icon scales up from center, 0 to 1.2 to 0 with fade), Expo Haptics `impactLight`
7. Pull-to-refresh: custom RefreshControl with copper-colored indicator, Reanimated scale-in (0 to 1) for refresh icon
8. usePressAnimation hook: returns `{ animatedStyle, gestureHandler }` ready to spread onto GestureDetector + Animated.View — reusable across all pressable components
9. All micro-interactions respect `useReducedMotion()`: reduced motion disables scale/translate springs (instant transform) but keeps opacity transitions
10. Performance: no micro-interaction causes frame time >16ms — all animations use Reanimated UI thread worklets, verified on Pixel 6

## File Paths

1. `apps/mobile/components/AnimatedPressable.tsx`
2. `apps/mobile/hooks/usePressAnimation.ts`
3. `apps/mobile/components/AnimatedListItem.tsx`
4. `apps/mobile/components/DoubleTapLike.tsx`
5. `apps/mobile/app/(tabs)/_layout.tsx`
6. `apps/mobile/components/CardBase.tsx`

## Implementation Notes

- AnimatedPressable (core building block):
  ```typescript
  import { Gesture, GestureDetector } from 'react-native-gesture-handler'
  import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
  import * as Haptics from 'expo-haptics'

  export function AnimatedPressable({ onPress, children, style, disabled }) {
    const scale = useSharedValue(1)
    const reducedMotion = useReducedMotion()

    const gesture = Gesture.Tap()
      .enabled(!disabled)
      .onBegin(() => {
        'worklet'
        if (!reducedMotion) {
          scale.value = withSpring(0.97, { damping: 25, stiffness: 200, mass: 0.8 })
        }
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      })
      .onFinalize((_, success) => {
        'worklet'
        scale.value = withSpring(1, { damping: 15, stiffness: 150, mass: 0.8 })
        if (success) runOnJS(onPress)()
      })

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[style, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    )
  }
  ```

- Double-tap like overlay:
  ```typescript
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet'
      heartScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 150 }),
        withTiming(0, { duration: 400 })
      )
      heartOpacity.value = withSequence(
        withTiming(1, { duration: 50 }),
        withDelay(300, withTiming(0, { duration: 200 }))
      )
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      runOnJS(handleLike)()
    })
  ```

- Tab underline slide: measure tab positions with `onLayout`, animate `left` and `width` shared values:
  ```typescript
  const underlineX = useSharedValue(0)
  const underlineWidth = useSharedValue(0)

  const onTabPress = (index, layout) => {
    underlineX.value = withSpring(layout.x, { damping: 20, stiffness: 130, mass: 0.9 })
    underlineWidth.value = withSpring(layout.width, { damping: 20, stiffness: 130, mass: 0.9 })
  }
  ```

- List entrance: use ref to track "has animated" — animate only on first mount, not re-renders
- Keep animations subtle: pressScale 0.97 is barely visible but felt — that's the point
