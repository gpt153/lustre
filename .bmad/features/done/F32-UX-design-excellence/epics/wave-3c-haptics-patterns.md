# Epic: Wave 3c — Rich Haptics Patterns (Expo Haptics)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 3 (Polish & Delight)
**Model:** haiku
**Estimate:** 2 days
**Dependencies:** Wave 2 complete

---

## Summary

Design and implement a comprehensive haptics system with 7+ distinct vibration patterns using Expo Haptics. Button presses, swipe thresholds, matches, badge unlocks, consent confirmations, picker selections, and errors each have their own haptic signature. Rich patterns use `notificationSuccess`, `notificationWarning`, `selectionChanged`, and custom sequences with precise timing. This creates a tactile language unique to Lustre — no other dating app has more than 3 haptic patterns.

## Acceptance Criteria

1. useLustreHaptics hook with named methods: tap(), swipeThreshold(), match(), badgeUnlock(), consentConfirm(), error(), success(), selection() — each triggers a distinct Expo Haptics pattern
2. tap(): `Haptics.impactAsync(ImpactFeedbackStyle.Light)` — single light tap for button presses, icon taps, toggles
3. swipeThreshold(): `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` — fires once when swipe translateX crosses threshold (±35% screen width), tracked via ref to prevent double-fire per swipe
4. match(): custom sequence — `impactLight`, 50ms pause, `impactMedium`, 100ms pause, `impactHeavy`, 50ms pause, `notificationSuccess` — synchronized with match ceremony visuals via setTimeout chain
5. badgeUnlock(): triple-tap — `impactLight`, 80ms, `impactLight`, 80ms, `impactMedium` — celebratory feel matching badge reveal animation
6. consentConfirm(): `Haptics.notificationAsync(NotificationFeedbackType.Success)` — single warm affirmation on consent ceremony completion
7. error(): `Haptics.notificationAsync(NotificationFeedbackType.Error)` — fires with form shake animation and validation errors
8. selection(): `Haptics.selectionAsync()` — fires on picker scroll, mode toggle crossing threshold, slider value snap — continuous selection feedback like native iOS picker
9. In-app haptics toggle in settings (default: on) — stored in Zustand preferences, checked before every haptic call via `if (!hapticsEnabled) return`
10. Haptics respect device capability: `Haptics.isAvailableAsync()` checked on mount, graceful no-op if unavailable (older devices, some Android manufacturers)

## File Paths

1. `apps/mobile/hooks/useLustreHaptics.ts`
2. `apps/mobile/constants/haptics.ts`
3. `apps/mobile/components/AnimatedPressable.tsx`
4. `apps/mobile/components/SwipeCard.tsx`
5. `apps/mobile/components/MatchCeremony.tsx`
6. `apps/mobile/app/(tabs)/profile/settings.tsx`

## Implementation Notes

- Haptic patterns definition:
  ```typescript
  // apps/mobile/constants/haptics.ts
  import * as Haptics from 'expo-haptics'

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

  export const HAPTIC_PATTERNS = {
    tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

    swipeThreshold: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

    match: async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      await delay(50)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await delay(100)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      await delay(50)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },

    badgeUnlock: async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      await delay(80)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      await delay(80)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    },

    consentConfirm: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

    error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

    selection: () => Haptics.selectionAsync(),
  } as const
  ```

- useLustreHaptics hook:
  ```typescript
  export function useLustreHaptics() {
    const hapticsEnabled = usePreferencesStore(s => s.hapticsEnabled)
    const [available, setAvailable] = useState(true)

    useEffect(() => {
      Haptics.isAvailableAsync?.().then(setAvailable).catch(() => setAvailable(false))
    }, [])

    const fire = useCallback((pattern: keyof typeof HAPTIC_PATTERNS) => {
      if (!hapticsEnabled || !available) return
      HAPTIC_PATTERNS[pattern]()
    }, [hapticsEnabled, available])

    return {
      tap: () => fire('tap'),
      swipeThreshold: () => fire('swipeThreshold'),
      match: () => fire('match'),
      badgeUnlock: () => fire('badgeUnlock'),
      consentConfirm: () => fire('consentConfirm'),
      error: () => fire('error'),
      success: () => fire('success'),
      selection: () => fire('selection'),
    }
  }
  ```

- Swipe threshold integration: in useSwipeGesture, track whether threshold has been crossed this swipe cycle:
  ```typescript
  const thresholdCrossed = useRef(false)
  onUpdate((e) => {
    if (Math.abs(e.translationX) > screenWidth * 0.35 && !thresholdCrossed.current) {
      thresholdCrossed.current = true
      runOnJS(haptics.swipeThreshold)()
    }
    if (Math.abs(e.translationX) < screenWidth * 0.35) {
      thresholdCrossed.current = false  // Reset if user pulls back
    }
  })
  ```

- Selection haptic for mode toggle: fire `selection()` as thumb crosses midpoint during Gesture.Pan drag
- No haptics for: passive scrolling, screen transitions, data loading, ambient animations
- Android note: some manufacturers (Samsung, Xiaomi) have weaker haptic motors — patterns will feel different but still functional
