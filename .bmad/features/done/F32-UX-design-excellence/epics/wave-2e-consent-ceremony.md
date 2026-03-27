# Epic: Wave 2e — Consent Ceremony (Skia Ring + WebSocket Sync)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 2 (Signature Interactions)
**Model:** sonnet (Skia ring animation + real-time multi-user WebSocket sync)
**Estimate:** 3 days
**Dependencies:** Wave 1 complete, F14 (ConsentVault) exists

---

## Summary

Transform the consent/SafeDate flow from a modal with checkboxes into a ceremony. Consent becomes a shared moment between two users — Skia animated copper ring, Reanimated staggered item reveal, react-native-svg stroke animation, Skia particle burst on confirmation, Expo Haptics success pattern, and synchronized multi-device state via existing WebSocket. This is Lustre's most innovative UX: making consent desirable, not just required.

## Acceptance Criteria

1. ConsentCeremony fullscreen overlay: warm charcoal backdrop (rgba(44,36,33,0.85)), centered content area with copper ring, rendered above all other content via absolute positioning in navigation
2. Skia animated copper ring: react-native-svg Circle with stroke-dashoffset animation driven by Reanimated shared value — circumference to 0 over 1.5s (`withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })`), copper (#B87333) stroke with Skia blur glow filter (shadowColor copper, shadowRadius 20, shadowOpacity 0.3)
3. Consent items appear one at a time with 400ms stagger via Reanimated: each item fades in (opacity 0 to 1) + slides up (translateY 16 to 0) using `withSpring(0, { damping: 20, stiffness: 100 })` with `withDelay(index * 400)`
4. Each consent item: phosphor-react-native icon (Shield for safety, Heart for intimacy, Lock for privacy), text in Inter Regular 16px, Pressable toggle with copper accent — toggle animates via Reanimated spring
5. Confirmation moment: when all items confirmed, Skia particle burst (30 particles, gold/copper, from ring edges inward), expo-linear-gradient fills ring area with gold gradient, `Haptics.notificationAsync(NotificationFeedbackType.Success)`
6. Real-time sync via existing ConsentVault WebSocket: when one user confirms an item, other user's UI updates in real-time — item icon gets checkmark, progress indicator advances (driven by WebSocket event handler updating shared values)
7. "Waiting for [name]..." state: when other user hasn't opened ceremony, show their avatar with Reanimated pulse animation (scale 1.0 to 1.05, `withRepeat(withSequence(withTiming(1.05,{duration:1500}), withTiming(1,{duration:1500})), -1)`) and copper shimmer
8. Exit animation: ring dissolves outward via Reanimated scale (1 to 1.2) + opacity (1 to 0) over 300ms, content fades out 200ms
9. SafeDate active shield: subtle animated copper border on screen edges when SafeDate is active — 2px border with Reanimated opacity `withRepeat(withSequence(withTiming(0.25,{duration:1500}), withTiming(0.15,{duration:1500})), -1)`
10. Reduced motion: ring appears instantly (no stroke animation), items appear all at once (no stagger), particle burst replaced with static gold fill, haptics still fire

## File Paths

1. `apps/mobile/components/ConsentCeremony.tsx`
2. `apps/mobile/components/ConsentRing.tsx`
3. `apps/mobile/components/SafeDateShield.tsx`
4. `apps/mobile/hooks/useConsentCeremony.ts`
5. `apps/mobile/components/ConsentItem.tsx`
6. `apps/mobile/app/_layout.tsx`

## Implementation Notes

- Ring drawing animation (react-native-svg + Reanimated):
  ```typescript
  import Svg, { Circle as SvgCircle } from 'react-native-svg'
  import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated'

  const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle)
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const dashOffset = useSharedValue(circumference)

  useEffect(() => {
    dashOffset.value = withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
  }, [])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }))

  <Svg width={280} height={280}>
    <AnimatedCircle
      cx={140} cy={140} r={radius}
      stroke="#B87333" strokeWidth={3}
      strokeDasharray={circumference}
      animatedProps={animatedProps}
      fill="none" strokeLinecap="round"
    />
  </Svg>
  ```

- Synchronized state via WebSocket:
  ```typescript
  interface ConsentState {
    items: {
      id: string
      label: string
      icon: 'shield' | 'heart' | 'lock'
      confirmedByMe: boolean
      confirmedByThem: boolean
    }[]
    allConfirmed: boolean
  }

  // On confirm: emit WebSocket event -> other user receives -> updates shared value
  // Reanimated drives UI update on shared value change
  ```

- Particle burst on confirmation: reuse `SkiaParticles` component from Wave 2c with 30 particles, but velocity directed inward (toward ring center) instead of outward

- SafeDate shield: rendered as absolute-positioned View in `apps/mobile/app/_layout.tsx`, only visible when SafeDate is active for current conversation
  ```typescript
  // Root layout
  {safeDateActive && <SafeDateShield />}
  ```

- Shield pulse:
  ```typescript
  const borderOpacity = useSharedValue(0.15)
  useEffect(() => {
    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 1500 }),
        withTiming(0.15, { duration: 1500 })
      ), -1
    )
  }, [])
  ```

- Consider sound integration: soft bell chime on final confirmation (if Wave 3e sound system available, otherwise defer)
