# Epic: Wave 2d — Copper Pick (Cinematic Daily Recommendation)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 2 (Signature Interactions)
**Model:** haiku
**Estimate:** 3 days
**Dependencies:** Wave 2a (uses ProfileCardStory component)

---

## Summary

Create a daily "Copper Pick" with a cinematic, premium native presentation. Unlike regular swipe cards, the Copper Pick gets fullscreen treatment: Reanimated Ken Burns photo zoom, parallax via shared values, expo-blur background transitions, expo-linear-gradient overlays, and an AI-generated "Why you match" blurb. Inspired by Hinge's "Most Compatible" but elevated with Lustre's native Warm UI.

## Acceptance Criteria

1. CopperPick renders as fullscreen presentation: hero photo fills screen via Image (resizeMode='cover') with Ken Burns zoom via Reanimated `withTiming(1.08, { duration: 10000, easing: Easing.linear })` on scale
2. expo-linear-gradient overlay at bottom 40%: colors ['transparent', 'rgba(44,36,33,0.6)'] for text readability, start/end points vertical
3. "Copper Pick" badge at top-left: copper pill background (#B87333), Star icon (phosphor-react-native, fill weight), General Sans SemiBold 12px white text, expo-blur BlurView behind pill (intensity 40), Reanimated glow pulse `withRepeat(withSequence(withTiming(8,{duration:1500}), withTiming(0,{duration:1500})), -1)` on shadowRadius
4. Profile info overlay at bottom: name (General Sans Bold 32px white, textShadow), age, location, and "Why you match" blurb (Inter Regular 16px warmCream at 90% opacity, max 2 lines, numberOfLines={2})
5. Entrance animation sequence (Reanimated orchestrated): photo fades from black (opacity 0 to 1, 800ms), badge slides from translateX -100 (200ms delay, spring), text fades up from translateY +20 (400ms delay, spring), copper glow fades in (600ms delay)
6. Action buttons at bottom: Like (Heart fill copper, 64px Pressable with AnimatedPressable scale), Pass (X charcoal, 56px), "Visa profil" (text underline) — centered row with SPACING.xl gap
7. Appears once per day at top of Discover stack: first card shown, regular cards follow after interaction
8. No swipe gesture on Copper Pick: `Gesture.Pan` disabled for this card — buttons only, preventing accidental pass of premium recommendation
9. No Copper Pick available: elegant fallback state with clock illustration (react-native-svg), "Kolla tillbaka imorgon" heading, time until next pick
10. Haptic on entrance completion: `Haptics.impactAsync(ImpactFeedbackStyle.Light)` when all entrance animations finish

## File Paths

1. `apps/mobile/components/CopperPick.tsx`
2. `apps/mobile/components/CopperPickBadge.tsx`
3. `apps/mobile/hooks/useCopperPick.ts`
4. `apps/mobile/app/(tabs)/discover.tsx`
5. `apps/mobile/components/ProfileCardStory.tsx`
6. `apps/mobile/components/illustrations/CheckBackTomorrow.tsx`

## Implementation Notes

- Ken Burns with Reanimated:
  ```typescript
  const scale = useSharedValue(1.0)
  const imageLoaded = useSharedValue(false)

  const onLoad = () => {
    imageLoaded.value = true
    scale.value = withTiming(1.08, { duration: 10000, easing: Easing.linear })
  }

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: withTiming(imageLoaded.value ? 1 : 0, { duration: 800 }),
  }))
  ```

- Entrance orchestration:
  ```typescript
  const photoOpacity = useSharedValue(0)
  const badgeTranslateX = useSharedValue(-100)
  const textTranslateY = useSharedValue(20)
  const textOpacity = useSharedValue(0)

  useEffect(() => {
    // Staggered entrance
    photoOpacity.value = withTiming(1, { duration: 800 })

    setTimeout(() => {
      badgeTranslateX.value = withSpring(0, SPRING.snappy)
    }, 200)

    setTimeout(() => {
      textTranslateY.value = withSpring(0, SPRING.gentle)
      textOpacity.value = withTiming(1, { duration: 300 })
    }, 400)

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, 800)
  }, [])
  ```

- No swipe on Copper Pick: wrap in a View without GestureDetector, or use `Gesture.Pan().enabled(false)`:
  ```typescript
  // In Discover screen, check if current card is CopperPick
  const panGesture = Gesture.Pan().enabled(!isCopperPick)
  ```

- Data: assumes `trpc.match.getCopperPick` endpoint exists or will be created. If unavailable, mock with highest-scored profile from discovery stack + placeholder "Why you match" text

- Parallax on scroll interaction (subtle): if user starts to scroll down on Copper Pick, photo shifts up at 0.3 ratio creating depth before button interaction
