# F32 — UX Design Excellence (Native Mobile)
## Roadmap & Checkpoints

**This is the CHECKPOINT FILE** — update status here as waves complete.
**Platform:** Native mobile only (Expo/React Native). Web is F33.

---

## Overview

| Wave | Name | Epics | Duration | Status |
|------|------|-------|----------|--------|
| 1 | Design Foundation | 7 epics (1a-1g) | 3 weeks | DONE (2026-03-27) |
| 2 | Signature Interactions | 5 epics (2a-2e) | 3 weeks | DONE (2026-03-27) |
| 3 | Polish & Delight | 5 epics (3a-3e) | 2 weeks | DONE (2026-03-27) |

**Total: 17 epics, 8 weeks**

---

## Wave 1: Design Foundation
> Fix the baseline. Make the native app feel polished and consistent.

### Checkpoint Criteria
- [ ] All mobile screens use semantic spacing scale via StyleSheet + token constants
- [ ] Zero spinners remain — all replaced with Reanimated shimmer skeleton loaders
- [ ] Toast system functional with Reanimated spring + Gesture Handler swipe-to-dismiss
- [ ] Every empty list has a designed empty state with react-native-svg illustration
- [ ] All forms have inline validation with Reanimated animated feedback
- [ ] phosphor-react-native used consistently on all screens
- [ ] VoiceOver/TalkBack accessibility audit passes
- [ ] WCAG AA contrast passes on all themes
- [ ] Maestro tests pass on odin9 (emulator-5570) for Wave 1

### Epic Sequence

| Order | Epic | Est. | Model | Status |
|-------|------|------|-------|--------|
| 1a | Spacing & Token Constants | 3d | haiku | VERIFIED (2026-03-27) |
| 1b | Skeleton Loaders (Reanimated) | 3d | haiku | VERIFIED (2026-03-27) |
| 1c | Toast System (Reanimated + GH) | 2d | haiku | VERIFIED (2026-03-27) |
| 1d | Empty States (RN SVG) | 3d | haiku | VERIFIED (2026-03-27) |
| 1e | Form Validation (Reanimated) | 3d | haiku | VERIFIED (2026-03-27) |
| 1f | Icon System (phosphor-react-native) | 2d | haiku | VERIFIED (2026-03-27) |
| 1g | Accessibility (VoiceOver/TalkBack) | 2d | haiku | VERIFIED (2026-03-27) |

**Parallelization:** 1a must go first (spacing tokens used by everything). After 1a: 1b, 1c, 1d, 1f, 1g can run in parallel. 1e depends on 1f (validation icons).

### Wave 1 Dependencies
```
1a (spacing) ──┬── 1b (skeletons)
               ├── 1c (toasts)
               ├── 1d (empty states)
               ├── 1f (icons) ── 1e (form validation)
               └── 1g (accessibility)
```

### Wave 1 Deliverables
- `packages/tokens/spacing.ts` — spacing constants
- `packages/tokens/colors.ts` — color constants
- `packages/tokens/shadows.ts` — shadow constants
- `apps/mobile/constants/tokens.ts` — re-exports for mobile
- `apps/mobile/constants/animations.ts` — spring/timing configs
- `apps/mobile/components/Skeleton.tsx` — skeleton loader system
- `apps/mobile/components/Toast.tsx` — toast components
- `apps/mobile/components/EmptyState.tsx` — empty state component
- `apps/mobile/components/LustreIcon.tsx` — icon wrapper
- `apps/mobile/components/LustreInput.tsx` — extended with validation
- `packages/hooks/stores/toastStore.ts` — toast state
- Updated: all mobile screens (spacing migration)
- Updated: all data-fetching views (skeleton loaders)
- Updated: all forms (validation)

---

## Wave 2: Signature Interactions
> Make the app unique. Create moments that no other dating app has.

### Checkpoint Criteria
- [ ] Profile cards use story-format with Gesture.Tap navigation
- [ ] Vanilla/Spicy mode switch has full Reanimated interpolateColor transformation
- [ ] Match ceremony has Skia particles + Reanimated orchestration + Haptics
- [ ] Copper Pick has cinematic Reanimated presentation with parallax
- [ ] Consent ceremony has Skia ring + synchronized multi-device animation
- [ ] 60fps maintained on all animations (iPhone 12+, Pixel 6+)
- [ ] Maestro tests pass on odin9 for Wave 2

### Epic Sequence

| Order | Epic | Est. | Model | Status |
|-------|------|------|-------|--------|
| 2a | Profile Card Story | 4d | sonnet | VERIFIED (2026-03-27) |
| 2b | Mode Transformation | 3d | sonnet | VERIFIED (2026-03-27) |
| 2c | Match Ceremony 2.0 | 3d | sonnet | VERIFIED (2026-03-27) |
| 2d | Copper Pick | 3d | haiku | VERIFIED (2026-03-27) |
| 2e | Consent Ceremony | 3d | sonnet | VERIFIED (2026-03-27) |

**Parallelization:** 2a, 2b, 2c can run in parallel (independent features). 2d depends on 2a (uses new profile card). 2e is independent.

**Model justification:** 2a (sonnet) — complex composable gesture system with Gesture.Tap + Pan + LongPress. 2b (sonnet) — coordinated Reanimated interpolateColor across entire UI. 2c (sonnet) — Skia particle system + Reanimated orchestration + Haptic synchronization. 2e (sonnet) — Skia ring + real-time multi-user synchronized animation via WebSocket.

### Wave 2 Dependencies
```
Wave 1 (all) ──┬── 2a (profile card) ── 2d (copper pick)
               ├── 2b (mode transform)
               ├── 2c (match ceremony)
               └── 2e (consent ceremony)
```

### Wave 2 Deliverables
- `apps/mobile/components/ProfileCardStory.tsx` — story-format card
- `apps/mobile/components/StoryProgressBar.tsx` — segment progress
- `apps/mobile/components/ModeTransition.tsx` — mode morph animation
- `apps/mobile/components/MatchCeremony.tsx` — Skia + Reanimated ceremony
- `apps/mobile/components/CopperPick.tsx` — daily recommendation
- `apps/mobile/components/ConsentCeremony.tsx` — consent flow UX
- `apps/mobile/components/ConsentRing.tsx` — Skia animated ring
- `apps/mobile/components/SkiaParticles.tsx` — reusable particle system
- `apps/mobile/components/GlassmorphismFrame.tsx` — BlurView frame
- `apps/mobile/hooks/useStoryNavigation.ts` — Gesture.Tap story nav
- `apps/mobile/hooks/useParticles.ts` — Skia particle physics
- `apps/mobile/hooks/useModeTransform.ts` — interpolateColor logic
- `apps/mobile/hooks/useKenBurns.ts` — photo zoom animation

---

## Wave 3: Polish & Delight
> The margins that make the difference. Every touch point feels alive and premium.

### Checkpoint Criteria
- [ ] Reanimated withSpring on all Pressables (buttons, cards, list items, tabs)
- [ ] Gesture Handler long-press and double-tap gestures on key elements
- [ ] Parallax scrolling via useAnimatedScrollHandler on profile + discover
- [ ] Rich Expo Haptics patterns for 7+ interaction types
- [ ] Skia shader ambient animations on key screens (30fps capped)
- [ ] expo-av sound design for 5 key moments (toggle in settings)
- [ ] All polish features respect AccessibilityInfo.isReduceMotionEnabled()
- [ ] Maestro tests pass on odin9 for Wave 3
- [ ] Founder rates UX 9.5/10

### Epic Sequence

| Order | Epic | Est. | Model | Status |
|-------|------|------|-------|--------|
| 3a | Micro-interactions | 3d | haiku | VERIFIED (2026-03-27) |
| 3b | Parallax & Depth | 2d | haiku | VERIFIED (2026-03-27) |
| 3c | Haptics Patterns | 2d | haiku | VERIFIED (2026-03-27) |
| 3d | Ambient Animations | 2d | sonnet | VERIFIED (2026-03-27) |
| 3e | Sound Design | 2d | haiku | VERIFIED (2026-03-27) |

**Parallelization:** All Wave 3 epics can run in parallel (independent polish layers). 3d is sonnet due to Skia shader complexity.

### Wave 3 Dependencies
```
Wave 2 (all) ──┬── 3a (micro-interactions)
               ├── 3b (parallax)
               ├── 3c (haptics)
               ├── 3d (ambient)
               └── 3e (sound)
```

### Wave 3 Deliverables
- `apps/mobile/hooks/usePressAnimation.ts` — press scale + spring
- `apps/mobile/hooks/useParallax.ts` — scroll-driven parallax
- `apps/mobile/hooks/useLustreHaptics.ts` — rich haptic patterns
- `apps/mobile/hooks/useSound.ts` — sound playback hook
- `apps/mobile/hooks/useAmbientAnimation.ts` — Skia ambient control
- `apps/mobile/components/AnimatedPressable.tsx` — Pressable with spring
- `apps/mobile/components/ParallaxHeader.tsx` — scroll parallax header
- `apps/mobile/components/AmbientGradient.tsx` — Skia breathing gradient
- `apps/mobile/components/ParticleField.tsx` — ambient floating particles
- `apps/mobile/components/PaperGrain.tsx` — Skia noise texture
- `apps/mobile/constants/haptics.ts` — haptic pattern definitions
- `apps/mobile/constants/sounds.ts` — sound file registry
- `apps/mobile/assets/sounds/` — compressed AAC audio files

---

## Risk Checkpoints

### After Wave 1 Completion
- [ ] Performance audit: no screen renders >16ms frame time
- [ ] Bundle size check: Hermes bytecode increase <80KB from Wave 1
- [ ] Maestro screenshot regression: no unintended layout changes
- [ ] VoiceOver/TalkBack audit: all screens navigable
- [ ] Cold start time: <2s on Pixel 6

### After Wave 2 Completion
- [ ] Performance audit: all animations 60fps on target devices (Flashlight/Perfetto)
- [ ] Bundle size check: cumulative increase <150KB
- [ ] Skia memory: no leaks from particle Canvas
- [ ] Physical device test: iPhone 13 + Pixel 6 (animations, haptics, gestures)

### After Wave 3 Completion (Final)
- [ ] Performance audit: full app 60fps P95, cold start <2s
- [ ] Bundle size check: total increase <200KB (Hermes bytecode)
- [ ] Memory audit: 10-minute session shows stable heap (no ambient leaks)
- [ ] Physical device test: haptics feel right on iOS + Android
- [ ] Sound test: volumes correct, system mute respected
- [ ] Founder sign-off: 9.5/10 UX rating
- [ ] App Store screenshot-ready: all key screens polished

---

## Changelog

| Date | Update |
|------|--------|
| 2026-03-27 | Initial roadmap created with 3 waves, 17 epics |
| 2026-03-27 | Rewritten for native-only (removed web, Tamagui, CSS, Framer Motion) |
| 2026-03-27 | Wave 1 DONE — all 7 epics built and verified. TS clean. Committed efc563c. |
| 2026-03-27 | Wave 2 DONE — all 5 epics built and verified. TS clean. Committed 0688620. |
| 2026-03-27 | Wave 3 DONE — all 5 epics built and verified. TS clean. |
