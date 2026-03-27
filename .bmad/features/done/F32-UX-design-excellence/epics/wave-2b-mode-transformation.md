# Epic: Wave 2b — Mode Transformation (Reanimated interpolateColor)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 2 (Signature Interactions)
**Model:** sonnet (coordinated multi-property animation across entire UI)
**Estimate:** 3 days
**Dependencies:** Wave 1 complete

---

## Summary

Transform the vanilla/spicy mode toggle from a simple pill switch into a full UI transformation experience. When switching modes, the entire interface morphs over 600ms using Reanimated `interpolateColor` for ALL color tokens, shared values for animation speed, and coordinated property transitions. This is Lustre's most unique UX differentiator — no other dating app transforms its entire UI between modes.

## Acceptance Criteria

1. Mode toggle triggers Reanimated shared value `modeProgress` (0=vanilla, 1=spicy) animated via `withSpring({ damping: 15, stiffness: 60, mass: 1.2 })` — 600ms perceived duration
2. `interpolateColor(modeProgress, [0,1], [vanillaColor, spicyColor])` applied to: background (warmWhite #FDF8F3 to warmTone #F5EDE4), accent (copper #B87333 to deepCopper #9A5E2A), card backgrounds, text colors, shadow opacity
3. Typography weight shift: vanilla fontWeight '400' body / '600' heading, spicy '500' / '700' — implemented via opacity crossfade between two Reanimated.Text elements (native can't interpolate fontWeight)
4. Animation speed multiplier: vanilla 1.0x, spicy 0.77x (1.3x perceived speed) — exposed via React Context `AnimationSpeedContext`, consumed by all animation hooks
5. Shadow depth transition: vanilla uses SHADOWS.sm, spicy uses SHADOWS.md — Reanimated interpolates shadowOpacity and shadowRadius between the two sets
6. Toggle component animates: pill thumb slides via `withSpring({ damping: 20, stiffness: 120, mass: 0.9 })`, copper glow pulses during transition (shadowRadius 0 to 12 to 0 synced with modeProgress)
7. Toggle icons: vanilla Sun, spicy Flame (phosphor-react-native) — crossfade via Reanimated opacity
8. Mode persists via existing Zustand useMode + AsyncStorage; transformation plays on app launch if stored mode differs from default
9. Reduced motion: instant color swap (modeProgress jumps to target, no spring), no glow pulse
10. All 4 theme variants respond correctly: light_vanilla, light_spicy, dark_vanilla, dark_spicy — each has distinct color values interpolated by modeProgress + system dark mode

## File Paths

1. `apps/mobile/components/ModeTransition.tsx`
2. `apps/mobile/hooks/useModeTransform.ts`
3. `apps/mobile/components/ModeToggle.tsx`
4. `apps/mobile/constants/tokens.ts`
5. `packages/hooks/hooks/useMode.ts`
6. `apps/mobile/constants/animations.ts`
7. `apps/mobile/app/_layout.tsx`

## Implementation Notes

- Reanimated interpolateColor for entire UI:
  ```typescript
  // apps/mobile/hooks/useModeTransform.ts
  const modeProgress = useSharedValue(0)  // 0 = vanilla, 1 = spicy

  const toggleMode = useCallback((toSpicy: boolean) => {
    const target = toSpicy ? 1 : 0
    if (reducedMotion) {
      modeProgress.value = target
    } else {
      modeProgress.value = withSpring(target, SPRING.gentle)
    }
  }, [reducedMotion])

  // Expose animated colors via context
  const backgroundColor = useDerivedValue(() =>
    interpolateColor(modeProgress.value, [0, 1], ['#FDF8F3', '#F5EDE4'])
  )
  const accentColor = useDerivedValue(() =>
    interpolateColor(modeProgress.value, [0, 1], ['#B87333', '#9A5E2A'])
  )
  ```

- AnimationSpeedContext:
  ```typescript
  const AnimationSpeedContext = createContext(1.0)

  function AnimationSpeedProvider({ children }) {
    const mode = useModeStore(s => s.mode)
    const speed = mode === 'spicy' ? 0.77 : 1.0
    return (
      <AnimationSpeedContext.Provider value={speed}>
        {children}
      </AnimationSpeedContext.Provider>
    )
  }

  // Usage in animation hooks:
  const speed = useContext(AnimationSpeedContext)
  withTiming(value, { duration: baseDuration * speed })
  ```

- Font weight crossfade:
  ```typescript
  // Two overlapping Text elements
  const vanillaOpacity = useDerivedValue(() => 1 - modeProgress.value)
  const spicyOpacity = useDerivedValue(() => modeProgress.value)

  <Animated.Text style={[styles.vanillaText, { opacity: vanillaOpacity }]}>
    {text}
  </Animated.Text>
  <Animated.Text style={[styles.spicyText, { opacity: spicyOpacity }]}>
    {text}
  </Animated.Text>
  ```

- Glow pulse on toggle:
  ```typescript
  const glowRadius = useDerivedValue(() =>
    interpolate(modeProgress.value, [0, 0.5, 1], [0, 12, 0])
  )
  ```

- ModeTransition wrapper in _layout.tsx: wraps entire app, provides modeProgress shared value and animated colors via context — all children can consume animated theme values
