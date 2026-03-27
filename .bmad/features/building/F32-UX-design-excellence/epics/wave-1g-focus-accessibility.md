# Epic: Wave 1g — Accessibility (VoiceOver/TalkBack)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 1 (Design Foundation)
**Model:** haiku
**Estimate:** 2 days
**Dependencies:** Wave 1a (spacing tokens)

---

## Summary

Optimize the mobile app for VoiceOver (iOS) and TalkBack (Android). Add proper accessibility roles, labels, and hints to all interactive elements. Implement Reanimated reduced motion support. Fix WCAG AA contrast issues across all 4 theme variants. Ensure proper focus management for modals and sheets.

## Acceptance Criteria

1. All interactive elements (Pressable, TouchableOpacity, TextInput) have accessibilityRole ('button', 'link', 'textbox', etc.), accessibilityLabel (human-readable), and accessibilityHint where action isn't obvious
2. Reduced motion support via Reanimated `useReducedMotion()`: all spring animations become instant (`{ damping: 100, stiffness: 1000 }`), all withTiming becomes duration 0, shimmer stops, parallax disabled, ambient animations stop
3. WCAG AA contrast audit completed for all 4 themes (light_vanilla, light_spicy, dark_vanilla, dark_spicy) — all text/background combinations meet 4.5:1 for body and 3:1 for large text (18px+)
4. Dark mode warm cream (#F5EDE4) on charcoal (#2C2421) verified at 10.2:1 — passes AAA
5. Copper accent text: restricted to 18px+ text and 24px+ icons only — body text always uses charcoal/cream
6. Modal/BottomSheet focus management: when opened, `AccessibilityInfo.setAccessibilityFocus(ref)` moves VoiceOver focus to first element in modal; on close, returns focus to trigger element
7. Minimum 44x44pt touch targets on all interactive elements (verified via layout measurements)
8. VoiceOver scroll mode: FlashList and ScrollView containers have `accessibilityRole="list"` and items have `accessibilityRole="listitem"` with position announcements
9. Custom gestures (swipe cards, story tap) have VoiceOver alternatives: swipe card shows Like/Pass buttons as accessible actions, story tap becomes swipe gesture in VoiceOver
10. Reduce motion preference persisted across app restarts via AccessibilityInfo listener + Reanimated automatic detection

## File Paths

1. `apps/mobile/components/AnimatedPressable.tsx`
2. `apps/mobile/components/LustreInput.tsx`
3. `apps/mobile/components/ModalBase.tsx`
4. `apps/mobile/components/BottomSheetBase.tsx`
5. `apps/mobile/hooks/useAccessibility.ts`
6. `apps/mobile/constants/animations.ts`
7. `apps/mobile/app/_layout.tsx`

## Implementation Notes

- useAccessibility hook:
  ```typescript
  import { AccessibilityInfo } from 'react-native'
  import { useReducedMotion } from 'react-native-reanimated'

  export function useAccessibility() {
    const reducedMotion = useReducedMotion()
    const [screenReaderEnabled, setScreenReaderEnabled] = useState(false)
    const [boldTextEnabled, setBoldTextEnabled] = useState(false)

    useEffect(() => {
      AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled)
      const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled)
      return () => sub.remove()
    }, [])

    return { reducedMotion, screenReaderEnabled, boldTextEnabled }
  }
  ```

- Reduced motion integration with animation constants:
  ```typescript
  import { useReducedMotion } from 'react-native-reanimated'
  const reducedMotion = useReducedMotion()
  const spring = reducedMotion ? REDUCED_MOTION.spring : SPRING.default
  ```

- Modal focus management:
  ```typescript
  const firstElementRef = useRef<View>(null)
  useEffect(() => {
    if (visible && firstElementRef.current) {
      const node = findNodeHandle(firstElementRef.current)
      if (node) AccessibilityInfo.setAccessibilityFocus(node)
    }
  }, [visible])
  ```

- VoiceOver swipe card alternative:
  ```typescript
  <View
    accessibilityRole="button"
    accessibilityLabel={`${profile.name}, ${profile.age}`}
    accessibilityActions={[
      { name: 'like', label: 'Gilla' },
      { name: 'pass', label: 'Passa' },
    ]}
    onAccessibilityAction={(event) => {
      if (event.nativeEvent.actionName === 'like') handleLike()
      if (event.nativeEvent.actionName === 'pass') handlePass()
    }}
  />
  ```

- Contrast fixes: if any combination fails, darken text or lighten background — never change brand colors
- Touch target audit: wrap small icons in 44x44 Pressable with `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}`
