# Epic: Wave 3b — Parallax & Depth (Reanimated ScrollHandler)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 3 (Polish & Delight)
**Model:** haiku
**Estimate:** 2 days
**Dependencies:** Wave 2 complete

---

## Summary

Add scroll-driven parallax effects and visual depth cues using Reanimated `useAnimatedScrollHandler` and `Animated.ScrollView`. Profile header photos scroll at different speeds than content. Card stacks show depth with scale and shadow. The app feels layered and three-dimensional — all running on the UI thread.

## Acceptance Criteria

1. Profile view header parallax: hero photo scrolls at 0.5x speed via Reanimated `useAnimatedScrollHandler` — `useAnimatedStyle(() => ({ transform: [{ translateY: scrollY.value * 0.5 }] }))` — photo moves slower than content, creating depth
2. Card stack depth on Discover: cards behind active card render at `interpolate(index, [0,1,2], [1, 0.95, 0.9])` scale and `interpolate(index, [0,1,2], [0, 8, 16])` translateY, with decreasing shadow opacity `interpolate(index, [0,1,2], [0.08, 0.05, 0.03])`
3. Shadow parallax: card shadowOffset.y shifts subtly with scroll position `interpolate(scrollY, [0, 300], [1, 4])` — cards appear to lift as user scrolls past them
4. useParallax hook: accepts scrollY (Reanimated SharedValue) and ratio (default 0.5), returns `useAnimatedStyle` with translateY — reusable across any scrollable view
5. Discover feed card entrance: cards scale from 0.9 to 1.0 and opacity 0 to 1 as they enter viewport — driven by scroll position via `useAnimatedScrollHandler` and `interpolate(scrollY, [itemTop-screenHeight, itemTop], [0.9, 1])` on scale
6. ParallaxHeader component: wraps hero image in Animated.View with parallax transform, includes `overflow: 'hidden'` to prevent photo from clipping outside its container during fast scroll
7. Reduced motion: all parallax disabled via `useReducedMotion()` — elements render at static positions, no scroll-driven transforms
8. Performance: all parallax uses Reanimated worklets on UI thread — zero JS thread involvement, maintains 60fps during fast scrolling on Pixel 6

## File Paths

1. `apps/mobile/hooks/useParallax.ts`
2. `apps/mobile/components/ParallaxHeader.tsx`
3. `apps/mobile/app/profile/[userId].tsx`
4. `apps/mobile/app/(tabs)/discover.tsx`
5. `apps/mobile/components/SwipeCard.tsx`

## Implementation Notes

- useParallax hook:
  ```typescript
  import { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated'
  import { useReducedMotion } from 'react-native-reanimated'

  export function useParallax(scrollY: SharedValue<number>, ratio: number = 0.5) {
    const reducedMotion = useReducedMotion()

    return useAnimatedStyle(() => {
      if (reducedMotion) return {}
      return {
        transform: [{ translateY: scrollY.value * (1 - ratio) }],
      }
    })
  }
  ```

- ParallaxHeader component:
  ```typescript
  import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'

  export function ParallaxHeader({ imageUri, height = 300, children }) {
    const scrollY = useSharedValue(0)
    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (e) => { scrollY.value = e.contentOffset.y },
    })

    const parallaxStyle = useParallax(scrollY, 0.5)

    return (
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        <View style={{ height, overflow: 'hidden' }}>
          <Animated.Image
            source={{ uri: imageUri }}
            style={[{ width: '100%', height: height * 1.3 }, parallaxStyle]}
            resizeMode="cover"
          />
        </View>
        {children}
      </Animated.ScrollView>
    )
  }
  ```

- Card stack depth (Discover):
  ```typescript
  // For each card in stack (index 0 = front, 1 = behind, 2 = 2nd behind)
  const cardStyle = useAnimatedStyle(() => {
    const behindIndex = index  // 0 for active, 1 for first behind, etc.
    return {
      transform: [
        { scale: interpolate(behindIndex, [0, 1, 2], [1, 0.95, 0.9]) },
        { translateY: interpolate(behindIndex, [0, 1, 2], [0, 8, 16]) },
      ],
      opacity: interpolate(behindIndex, [0, 1, 2], [1, 0.8, 0.6]),
      ...SHADOWS[behindIndex === 0 ? 'md' : behindIndex === 1 ? 'sm' : 'sm'],
      shadowOpacity: interpolate(behindIndex, [0, 1, 2], [0.08, 0.05, 0.03]),
    }
  })
  ```

- Clipping: parallax header needs container with `overflow: 'hidden'` — image is taller than container (1.3x) so it has room to translate
- Scroll-driven card entrance: use `onLayout` to get item top position, interpolate scale/opacity based on scrollY proximity to item position
