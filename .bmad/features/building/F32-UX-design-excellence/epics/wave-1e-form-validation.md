# Epic: Wave 1e — Form Validation (Reanimated Animated Feedback)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 1 (Design Foundation)
**Model:** haiku
**Estimate:** 3 days
**Dependencies:** Wave 1a (spacing), Wave 1f (icons for checkmark/error indicators)

---

## Summary

Add inline real-time form validation to all mobile forms using Zod schemas (reused from tRPC) with Reanimated 3 animated error messages, interpolateColor for border glow transitions, spring shake on submit failure, and Expo Haptics error feedback.

## Acceptance Criteria

1. LustreInput extended with props: error (string), success (boolean), helperText (string) — each triggers Reanimated-driven visual state transition
2. Error state: Reanimated `interpolateColor` transitions border from charcoal to ember (#C85A3A) over 200ms, error message slides down via `withSpring(height, { damping: 20, stiffness: 200 })`, WarningCircle icon (phosphor-react-native) in ember at right edge
3. Success state: CheckCircle icon (phosphor-react-native) in sage (#7A9E7E) fades in via Reanimated opacity 0 to 1 at right edge, border transitions to sage via interpolateColor
4. Validation triggers: on blur (first validation), on change after first blur (re-validation, debounced 300ms), on submit (validate all fields)
5. Form-level shake on submit with errors: Reanimated `withSequence(withTiming(4,{duration:50}), withTiming(-4,{duration:50}), withTiming(4,{duration:50}), withTiming(-4,{duration:50}), withTiming(4,{duration:50}), withTiming(0,{duration:50}))` on translateX + `Haptics.notificationAsync(NotificationFeedbackType.Error)`
6. ValidatedForm wrapper component integrates react-hook-form + @hookform/resolvers/zod, auto-wires validation state to child LustreInput fields
7. All existing mobile forms migrated: registration, login, profile edit, settings, report, event creation (minimum 6 forms)
8. Zod schemas reused from tRPC router input definitions where applicable (no duplicate validation logic)
9. Error fields scroll into view via `scrollTo` with Reanimated `scrollTo(ref, 0, errorY - 100, true)` when off-screen
10. Accessibility: error messages linked via `accessibilityDescribedBy`, `accessibilityState={{ invalid: true }}` on error inputs

## File Paths

1. `apps/mobile/components/LustreInput.tsx`
2. `apps/mobile/components/ValidatedForm.tsx`
3. `apps/mobile/hooks/useFormShake.ts`
4. `apps/mobile/app/(auth)/register.tsx`
5. `apps/mobile/app/(auth)/login.tsx`
6. `apps/mobile/app/(tabs)/profile/edit.tsx`
7. `apps/mobile/app/(tabs)/profile/settings.tsx`

## Implementation Notes

- Border color interpolation (Reanimated):
  ```typescript
  const borderProgress = useSharedValue(0)  // 0 = neutral, 1 = error, 2 = success
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1, 2],
      ['#2C2421', '#C85A3A', '#7A9E7E']  // charcoal, ember, sage
    ),
    borderWidth: 1.5,
  }))
  ```
- Error message enter with height animation:
  ```typescript
  const errorHeight = useSharedValue(0)
  const errorOpacity = useSharedValue(0)
  // On error: errorHeight.value = withSpring(24, { damping: 20, stiffness: 200 })
  // On clear: errorHeight.value = withTiming(0, { duration: 150 })
  ```
- useFormShake hook:
  ```typescript
  export function useFormShake() {
    const shakeX = useSharedValue(0)
    const shake = useCallback(() => {
      shakeX.value = withSequence(
        withTiming(4, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      )
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }, [])
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shakeX.value }],
    }))
    return { shake, animatedStyle }
  }
  ```
- react-hook-form with @hookform/resolvers/zod:
  ```typescript
  const { control, handleSubmit } = useForm({ resolver: zodResolver(profileSchema) })
  ```
- Consider password strength indicator: 4-bar meter with copper fill progression via Reanimated interpolate
