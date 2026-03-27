# Epic: Wave 1c — Toast Notification System (Reanimated + Gesture Handler)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 1 (Design Foundation)
**Model:** haiku
**Estimate:** 2 days
**Dependencies:** Wave 1a (uses spacing tokens)

---

## Summary

Build a toast notification system with 4 variants (success, error, info, warning) using Zustand for state management, Reanimated 3 for spring slide-in/out animations on the UI thread, and Gesture Handler for native swipe-to-dismiss. Toasts slide in from top, auto-dismiss, stack up to 3, and are accessible via AccessibilityInfo.

## Acceptance Criteria

1. Toast store (Zustand) with methods: toast.success(msg), toast.error(msg, opts?), toast.info(msg), toast.warning(msg) — callable from anywhere including outside React tree via `toastStore.getState().success(msg)`
2. Four visual variants: success (sage #7A9E7E at 15% bg, CheckCircle icon), error (ember #C85A3A at 15% bg, WarningCircle icon), info (copper #B87333 at 15% bg, Info icon), warning (gold #D4A843 at 15% bg, Warning icon)
3. Enter animation: Reanimated `withSpring(0, { damping: 20, stiffness: 150, mass: 0.8 })` on translateY from -120px, fully on UI thread
4. Exit animation: Reanimated `withTiming(-120, { duration: 200 })` on translateY with opacity fade
5. Swipe-to-dismiss via Gesture Handler: `Gesture.Pan` tracking vertical translation, velocity threshold 500px/s fling-up triggers dismiss with `withSpring`
6. Maximum 3 toasts visible simultaneously, FIFO ordering, new toasts push existing ones down via Reanimated layout animation
7. Auto-dismiss after 4000ms (configurable per toast), with optional action button (label + onPress callback)
8. Accessibility: `AccessibilityInfo.announceForAccessibility(message)` called on toast appearance
9. All existing mobile mutations (profile update, message send, report, block, etc.) wired to show appropriate toast on success/error
10. Toast container positioned below safe area inset (top) using `useSafeAreaInsets()` from react-native-safe-area-context

## File Paths

1. `packages/hooks/stores/toastStore.ts`
2. `apps/mobile/components/Toast.tsx`
3. `apps/mobile/hooks/useToast.ts`
4. `apps/mobile/app/_layout.tsx`
5. `apps/mobile/components/ToastContainer.tsx`
6. `apps/mobile/hooks/useMutationToast.ts`

## Implementation Notes

- Zustand store shape:
  ```typescript
  interface ToastState {
    toasts: Toast[]
    success: (message: string, opts?: ToastOpts) => void
    error: (message: string, opts?: ToastOpts) => void
    info: (message: string, opts?: ToastOpts) => void
    warning: (message: string, opts?: ToastOpts) => void
    dismiss: (id: string) => void
    clearAll: () => void
  }
  interface Toast {
    id: string
    variant: 'success' | 'error' | 'info' | 'warning'
    message: string
    action?: { label: string; onPress: () => void }
    duration: number  // default 4000
    createdAt: number
  }
  ```
- Gesture Handler swipe-to-dismiss:
  ```typescript
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.min(0, e.translationY)  // Only allow upward drag
    })
    .onEnd((e) => {
      if (e.velocityY < -500 || e.translationY < -50) {
        translateY.value = withSpring(-200, SPRING.stiff)
        runOnJS(dismiss)(id)
      } else {
        translateY.value = withSpring(0, SPRING.snappy)
      }
    })
  ```
- Toast background: View with `backgroundColor` at 15% opacity + 3px left border with full variant color
- Icon: phosphor-react-native (from Wave 1f), 20px, variant color — import directly for tree-shaking
- useMutationToast wrapper:
  ```typescript
  function useMutationToast<T>(mutation: UseMutationResult<T>, successMsg: string) {
    useEffect(() => {
      if (mutation.isSuccess) toastStore.getState().success(successMsg)
      if (mutation.isError) toastStore.getState().error(mutation.error.message)
    }, [mutation.isSuccess, mutation.isError])
  }
  ```
- Mount ToastContainer as last child in `apps/mobile/app/_layout.tsx` (renders above everything)
