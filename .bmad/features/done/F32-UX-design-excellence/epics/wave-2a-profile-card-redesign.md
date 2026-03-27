# Epic: Wave 2a — Profile Card Redesign (Story Format)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 2 (Signature Interactions)
**Model:** sonnet (complex composable gesture system)
**Estimate:** 4 days
**Dependencies:** Wave 1 complete

---

## Summary

Redesign the profile card from a static photo+bio layout to a story-format tap-through experience using Gesture Handler composable gestures. Photos and prompts interleave. Users tap left/right regions via Gesture.Tap to navigate segments. Reanimated Ken Burns zoom on photos. Skia gradient overlays for text readability. Progress indicator at top. Swipe left/right via Gesture.Pan still triggers pass/like. Gesture.LongPress pauses animation and shows full photo.

## Acceptance Criteria

1. ProfileCardStory renders profile as tap-through segments using `Gesture.Tap`: tap right 70% of screen to advance, tap left 30% to go back — gesture regions defined by `Gesture.Tap().maxDistance(5)` to distinguish from swipe
2. Progress indicator: segmented bar at top, copper (#B87333) fill for viewed segments, warm gray (#E8DDD3) for unseen, 3px height, 2px gap between segments, rendered via react-native-svg Rect elements with Reanimated animated width
3. Photo segments: full-bleed Image with Ken Burns effect via Reanimated `withTiming(1.05, { duration: 8000, easing: Easing.linear })` on scale while visible, expo-linear-gradient overlay at bottom (transparent to rgba(44,36,33,0.6)) for text readability
4. Prompt segments: centered text on warm cream background, prompt question in Inter Regular 14px at 60% opacity, answer in General Sans SemiBold 22px charcoal, Skia noise shader at 2% for paper-grain texture
5. Parallax during swipe: photo translateX driven by swipe shared value at -0.1 ratio (`photoTranslateX = interpolate(swipeX, [-width, 0, width], [width*0.1, 0, -width*0.1])`) creating depth
6. Name/age/location overlay: bottom-left with SPACING.md padding, General Sans Bold 24px white, `textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width:0,height:2}, textShadowRadius: 8`
7. Interaction buttons overlaid at bottom: Like (Heart fill copper, 56px), Pass (X charcoal, 56px), SuperLike (Star gold, 56px) — in a row with SPACING.lg spacing, expo-blur BlurView pill background (intensity 40)
8. Gesture composition: `Gesture.Exclusive(Gesture.Pan(), Gesture.Tap())` — swipe takes priority over tap when horizontal movement >20px
9. `Gesture.LongPress({ minDuration: 300 })` pauses Ken Burns (scale.cancelAnimation()), shows full resolution photo, resumes on release
10. VoiceOver fallback: when `screenReaderEnabled`, render as vertical ScrollView with all segments visible — FlashList with photo and prompt items, Like/Pass as accessible actions

## File Paths

1. `apps/mobile/components/ProfileCardStory.tsx`
2. `apps/mobile/components/StoryProgressBar.tsx`
3. `apps/mobile/hooks/useStoryNavigation.ts`
4. `apps/mobile/hooks/useKenBurns.ts`
5. `apps/mobile/app/(tabs)/discover.tsx`
6. `apps/mobile/components/SwipeCard.tsx`
7. `apps/mobile/app/profile/[userId].tsx`

## Implementation Notes

- Composable gesture setup:
  ```typescript
  import { Gesture, GestureDetector } from 'react-native-gesture-handler'

  const tapGesture = Gesture.Tap()
    .maxDistance(5)
    .onEnd((e) => {
      'worklet'
      const tapX = e.absoluteX
      const isRightSide = tapX > screenWidth * 0.3
      if (isRightSide) {
        runOnJS(nextSegment)()
      } else {
        runOnJS(prevSegment)()
      }
    })

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])  // Only activate after 20px horizontal
    .onUpdate((e) => { /* existing swipe logic */ })
    .onEnd((e) => { /* like/pass based on velocity/position */ })

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => { cancelAnimation(scale) })
    .onEnd(() => { scale.value = withTiming(1.05, { duration: remainingTime }) })

  const composed = Gesture.Race(
    Gesture.Exclusive(panGesture, tapGesture),
    longPressGesture
  )
  ```

- Ken Burns hook:
  ```typescript
  export function useKenBurns(active: boolean) {
    const scale = useSharedValue(1)
    useEffect(() => {
      if (active) {
        scale.value = 1
        scale.value = withTiming(1.05, {
          duration: 8000,
          easing: Easing.linear,
        })
      }
    }, [active])
    return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  }
  ```

- Segment transition: 200ms crossfade via Reanimated opacity + subtle scale (0.98 to 1.0)
- Photo preloading: `Image.prefetch(nextSegmentUri)` for instant transitions
- Prompt background cycle: subtle variations (warmWhite, light copper tint rgba(184,115,51,0.03), light gold tint rgba(212,168,67,0.03))
