# F32 — UX Design Excellence (Native Mobile)
## Product Requirements Document

**Feature ID:** F32
**Status:** In Progress
**Priority:** P0 (Founder's #1 priority)
**Owner:** Samuel
**Created:** 2026-03-27
**Updated:** 2026-03-27 (rewritten for native-only)
**Dependencies:** F31 (Design System — DONE)
**Touches:** F04, F08, F13, F14, F15, F18, F25
**Platform:** Native mobile only (Expo/React Native). Web is F33.

---

## 1. Problem Statement

Lustre is technically feature-rich (31 shipped features) but the UI/UX quality sits at ~7.5/10 — "mediocre" by the founder's assessment. The app looks and feels like an engineer built it, not a designer. Buttons resemble Bootstrap with copper paint. Cards are flat boxes with border-radius. Spacing varies arbitrarily. There are no skeleton loaders, no empty states, no micro-interactions, no toast system, and no focus rings.

Dating apps live or die by feel. Tinder's buttery 120fps card stack, Hinge's momentum-driven vertical scroll, and Bumble's spring-animated tab bar each create a visceral emotional response through native platform affordances. Lustre currently creates none. Users will churn before discovering the genuinely innovative features (ConsentVault, SafeDate, Dual Mode, AI Coaching) because the surface doesn't earn their trust.

This PRD covers the **native mobile app only** (Expo/React Native). Web app UX is handled separately in F33.

## 2. Vision

Transform Lustre's mobile app from "engineer-built prototype" to "best-in-class native dating app" by establishing "Warm UI" as a new design paradigm — the first dating app that feels intimate, tactile, and emotionally resonant through copper/gold warmth, ceremony-driven interactions, consent-as-beauty, and leveraging every native capability: Reanimated 3 worklets on the UI thread, Gesture Handler composable gestures, Expo Haptics rich patterns, React Native Skia GPU-accelerated particles, and expo-av sound design.

## 3. User Stories

### 3.1 Design Foundation (Wave 1)

**US-3201:** As a user, I want consistent spacing throughout the app so it feels polished and intentional.
- Acceptance: All screens use the defined spacing scale (xs=4, sm=8, md=16, lg=24, xl=32, xxl=48) via StyleSheet.create and design token constants.

**US-3202:** As a user, I want to see content loading progressively (skeleton loaders) so the app feels fast and responsive.
- Acceptance: Every data-fetching view shows skeleton placeholders instead of spinners. Skeletons match the shape of incoming content. Reanimated 3 shimmer animation at 1.5s cycle with copper tint running on UI thread.

**US-3203:** As a user, I want clear feedback when actions succeed or fail (toasts) so I know what happened.
- Acceptance: Toast system with 4 variants (success, error, info, warning). Reanimated spring slide-in from top, Gesture Handler swipe-to-dismiss, auto-dismisses in 4s. Stacks up to 3. Copper-accented. Accessible via AccessibilityInfo announcement.

**US-3204:** As a user, I want helpful empty states so I'm never confused by a blank screen.
- Acceptance: Every list/feed has a designed empty state with react-native-svg illustration, heading, body text, and CTA button. Reanimated entrance animation.

**US-3205:** As a user, I want inline form validation so I can correct errors before submitting.
- Acceptance: Real-time validation on blur with Reanimated animated error messages. Reanimated interpolateColor for border glow (charcoal to ember). Spring shake on submit with errors.

**US-3206:** As a user who uses VoiceOver/TalkBack, I want proper accessibility so I can navigate the app.
- Acceptance: All interactive elements have proper accessibilityRole, accessibilityLabel, accessibilityHint. Focus management via AccessibilityInfo. VoiceOver/TalkBack tested on both platforms.

**US-3207:** As a user, I want a consistent icon system so the app feels cohesive.
- Acceptance: phosphor-react-native used consistently across all screens. Custom copper-filled variants for tab bar.

### 3.2 Signature Interactions (Wave 2)

**US-3208:** As a user, I want to browse profiles like stories — tapping through photos and prompts — so profiles feel alive.
- Acceptance: Profile card uses Gesture.Tap for story navigation (left/right regions). Reanimated Ken Burns zoom on photos. Skia gradient overlays. Progress indicator at top.

**US-3209:** As a user, I want the vanilla/spicy mode switch to feel like a transformation, not just a color change.
- Acceptance: Reanimated interpolateColor for ALL theme token transitions. 600ms coordinated morph. Typography weight shifts, animation speed changes, shadow depth changes.

**US-3210:** As a user, I want the match moment to feel like a celebration.
- Acceptance: Skia particle burst (60 particles, 2s). Reanimated orchestrated entrance. Expo Haptics synchronized sequence. expo-blur glassmorphism frames. expo-linear-gradient breathing background. 5s ceremony before chat prompt.

**US-3211:** As a user, I want a daily "Copper Pick" recommendation that feels special and cinematic.
- Acceptance: Fullscreen Reanimated Ken Burns on photo. Parallax via Reanimated shared values. expo-blur background blur transition. "Why you match" AI blurb. Distinct from regular swipe stack.

**US-3212:** As a user, I want the consent flow to feel like a ceremony, not a checkbox form.
- Acceptance: Skia animated copper ring. Reanimated staggered item reveal. Synchronized multi-device via WebSocket. Skia particle burst on confirmation. Expo Haptics success pattern.

### 3.3 Polish & Delight (Wave 3)

**US-3213:** As a user, I want subtle animations on every interaction so the app feels alive.
- Acceptance: Reanimated withSpring on every Pressable (scale 0.97, damping 25, stiffness 200). Gesture Handler for long-press context menus, double-tap to like. FlashList with LayoutAnimation staggered entrance.

**US-3214:** As a user, I want depth and parallax in scrollable views so content feels layered.
- Acceptance: Reanimated useAnimatedScrollHandler for profile header parallax (0.5 ratio). Card stack depth (scale 0.95, 0.9). Shadow shift on scroll.

**US-3215:** As a user, I want distinct haptic feedback for different actions so I can feel the app.
- Acceptance: Rich Expo Haptics patterns — impactLight for tap, impactMedium for threshold, notificationSuccess for consent, custom sequence for match (light-medium-heavy-success), selectionChanged for picker scroll.

**US-3216:** As a user, I want ambient animations that make the app feel warm and alive.
- Acceptance: Skia shader for breathing copper gradients (3 color stops, 8s cycle). Reanimated frame callbacks capped at 30fps. Floating Skia particles on profile view.

**US-3217:** As a user, I want subtle sound design at key moments.
- Acceptance: expo-av with preloaded Audio.Sound instances. Match chime (<1s). Message sent whoosh (<0.3s). Badge ding (<0.5s). Haptic+sound synchronized via shared timing. Sounds off by default. In-app toggle.

## 4. Requirements

### 4.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Unified spacing scale applied to all mobile screens | P0 |
| FR-02 | Skeleton loader with Reanimated shimmer on UI thread | P0 |
| FR-03 | Toast system with Reanimated + Gesture Handler | P0 |
| FR-04 | Empty state component with react-native-svg illustrations | P0 |
| FR-05 | Inline form validation with Reanimated animations | P0 |
| FR-06 | VoiceOver/TalkBack accessibility optimization | P0 |
| FR-07 | phosphor-react-native integration (replace all icons) | P0 |
| FR-08 | Story-format profile card with Gesture.Tap | P1 |
| FR-09 | Mode transformation with Reanimated interpolateColor | P1 |
| FR-10 | Match ceremony with Skia particles + Reanimated + Haptics | P1 |
| FR-11 | Copper Pick with cinematic Reanimated presentation | P1 |
| FR-12 | Consent ceremony with Skia ring + WebSocket sync | P1 |
| FR-13 | Micro-interaction library (withSpring on all touchables) | P2 |
| FR-14 | Parallax scroll with useAnimatedScrollHandler | P2 |
| FR-15 | Rich Expo Haptics pattern library | P2 |
| FR-16 | Skia shader ambient animations | P2 |
| FR-17 | expo-av sound design integration | P2 |

### 4.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | All animations 60fps on iPhone 12+ / Pixel 6+ | 60fps P95 |
| NFR-02 | Frame time budget per frame | <16ms |
| NFR-03 | Cold start time (splash to interactive) | <2s |
| NFR-04 | Hermes engine bytecode bundle size increase from F32 | <200KB |
| NFR-05 | Skeleton-to-content transition latency after data arrives | <100ms |
| NFR-06 | Sound files total (compressed AAC) | <500KB |
| NFR-07 | Mode transformation perceived duration | <700ms |
| NFR-08 | Zero layout shift during skeleton-to-content swap | CLS 0 |
| NFR-09 | JS thread blocking during animations | 0ms (all on UI thread) |
| NFR-10 | Memory usage increase from ambient animations | <15MB |
| NFR-11 | All text meets WCAG AA contrast (4.5:1 body, 3:1 large) | AA minimum |

### 4.3 Accessibility Requirements

| ID | Requirement |
|----|-------------|
| A11Y-01 | All interactive elements have accessibilityRole, accessibilityLabel |
| A11Y-02 | Toasts announced via AccessibilityInfo.announceForAccessibility() |
| A11Y-03 | Skeleton loaders announce "Loading" via accessibilityState={{ busy: true }} |
| A11Y-04 | Reduced motion support: AccessibilityInfo.isReduceMotionEnabled() disables all non-essential animation |
| A11Y-05 | Empty states reachable and readable by VoiceOver/TalkBack |
| A11Y-06 | Sound design respects system mute and has in-app toggle |
| A11Y-07 | All color combinations meet WCAG AA (fix dark mode warm cream issue) |
| A11Y-08 | Profile card story format has VoiceOver scroll fallback (renders as scrollable list) |
| A11Y-09 | Minimum 44x44pt touch targets on all interactive elements (Apple HIG) |

## 5. Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Founder UX rating | 7.5/10 | 9.5/10 | Subjective assessment |
| App Store rating | N/A (pre-launch) | 4.7+ | App Store / Play Store |
| Session duration | Baseline TBD | +25% | Umami analytics |
| Swipe-to-match engagement | Baseline TBD | +15% | Backend metrics |
| Profile completion rate | Baseline TBD | +20% | Backend metrics |
| D7 retention | Baseline TBD | +10pp | Umami cohort analysis |
| Animation frame rate | Mixed | 60fps P95 | Flashlight / Perfetto |
| Cold start time | TBD | <2s | Maestro timing |
| JS thread utilization during animations | High | <5% | Flipper |

## 6. Out of Scope

- Backend API changes (this is purely mobile frontend/UX)
- Web app UX (separate feature F33)
- New feature logic (no new matching algorithms, no new chat features)
- Branding changes (copper/gold palette stays, fonts stay)
- Onboarding flow redesign (separate feature)
- Push notification redesign (separate feature)
- Payment/subscription UI (separate feature)

## 7. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Animation perf on low-end Android | High | Medium | Test on Pixel 4a, cap ambient at 30fps, use Reanimated UI thread worklets exclusively |
| Skia integration complexity | Medium | Medium | Start with particles only, use Reanimated for everything else, Skia for GPU-specific effects |
| Bundle size bloat from icons + sounds | Medium | Medium | Tree-shake phosphor-react-native, compress audio to AAC, lazy-load sounds |
| Spacing migration breaks existing layouts | Medium | High | Migrate screen-by-screen with Maestro screenshot regression |
| Reduced motion breaks core UX flows | Medium | Low | Ensure all animated flows have static fallbacks |
| Haptic patterns feel wrong on Android vs iOS | Medium | Medium | Test on physical devices for both platforms, tune per-platform |
| Expo SDK 53 New Architecture issues | Medium | Low | Pin to stable Expo SDK, use canary only for Skia if needed |

## 8. Tech Stack (Native Only)

| Technology | Purpose | Version |
|------------|---------|---------|
| Expo SDK | App platform | 53+ (New Architecture) |
| Expo Router | File-based navigation | v4 |
| React Native Reanimated | ALL animations | 3.x |
| React Native Gesture Handler | ALL gestures | 2.x |
| Expo Haptics | Tactile feedback | latest |
| Expo AV | Sound playback | latest |
| Expo Blur | Glassmorphism (BlurView) | latest |
| Expo Linear Gradient | Gradient backgrounds | latest |
| @shopify/react-native-skia | Particles, shader gradients | latest |
| @shopify/flash-list | 60fps list rendering | latest |
| react-native-svg | Illustrations, ring animation | latest |
| phosphor-react-native | Icon system | latest |
| lottie-react-native | Celebration animations (backup) | latest |
| Zustand | State management | 4.x |
| TanStack Query | Data fetching | 5.x |
| tRPC client | API calls | 11.x |

## 9. Timeline

| Wave | Content | Duration | Milestone |
|------|---------|----------|-----------|
| Wave 1 | Design Foundation | 3 weeks | App feels polished and consistent |
| Wave 2 | Signature Interactions | 3 weeks | App feels unique and emotionally resonant |
| Wave 3 | Polish & Delight | 2 weeks | App feels alive and premium |
| **Total** | | **8 weeks** | **9.5/10 UX quality** |
