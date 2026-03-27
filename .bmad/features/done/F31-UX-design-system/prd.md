# PRD: UI/UX Design System Redesign

## Overview

A complete visual and interaction redesign of the Lustre dating platform (Expo mobile app + Next.js web app). The current prototype-quality UI with generic Material Design colors, 12 mobile tabs, flat bordered cards, and basic animations must be replaced with a premium, brand-driven design system derived from the Lustre hammered copper lotus/flame logo. The goal is visual and interaction parity with Tinder, Hinge, Bumble, and Feeld — competitive dating apps set the floor for user expectations.

## Target Audience

All Lustre users. The redesign affects every screen and interaction. Users judge dating apps within seconds of opening; a premium look directly impacts retention and perceived trustworthiness.

## Core Design Decisions

- **Logo-derived palette** — All colors sourced from the 3D hammered copper lotus with golden flame logo. Copper (#B87333) as primary brand, gold (#D4A843) for CTAs and highlights, warm white (#FDF8F3) instead of pure white.
- **5-tab navigation** — Consolidate 12 mobile tabs into 5 (Discover, Connect, Explore, Learn, Profile) and 8 web links into glassmorphism header with 4 center links + avatar dropdown.
- **Shadows over borders** — No 1px borders on cards. Depth via subtle copper-tinted shadows and warm cream backgrounds.
- **Hinge-style profiles** — Scrollable full-page profiles with photos interspersed with prompt responses, each individually likeable.
- **Reanimated 3 animations** — Migrate from legacy Animated API to spring-physics-based Reanimated 3 for 60fps gesture animations.
- **Proper dark mode** — Warm dark tones (#1A1614 bg, #2C2421 surface) with copper undertones, not generic Material Design dark.

## Functional Requirements (FR)

### FR-1: Design Token System
- Priority: Must
- Acceptance criteria:
  - Given the Tamagui config, then all 12 brand colors (copper, copperLight, copperMuted, gold, goldBright, goldDeep, warmWhite, warmCream, charcoal, warmGray, ember, sage) are defined as tokens
  - Given light mode, then background is warmWhite (#FDF8F3), surface is warmCream (#F5EDE4), text is charcoal (#2C2421)
  - Given dark mode, then background is #1A1614, surface is #2C2421, surfaceUp is #3D332E, text is warmCream (#F5EDE4), accent is goldBright (#E8B84B)
  - Given vanilla mode, then accent colors use sage (#7A9E7E) for mode indicators
  - Given spicy mode, then accent colors use ember (#E05A33) for mode indicators

### FR-2: Typography System
- Priority: Must
- Acceptance criteria:
  - Given heading text, then the Sohne font (or General Sans fallback) is used
  - Given body text, then Inter is used
  - Given the "Lustre" brand text, then it is rendered in Sohne Halbfett with custom letter-spacing, never as plain text
  - Given Tamagui config, then font families are registered with size/weight/line-height scales

### FR-3: Mobile Navigation (5 Tabs)
- Priority: Must
- Acceptance criteria:
  - Given the mobile app, then exactly 5 bottom tabs are shown: Discover, Connect, Explore, Learn, Profile
  - Given the Discover tab, then it contains the feed, swipe, and search screens
  - Given the Connect tab, then it contains chat, matches, and gatekeeper screens
  - Given the Explore tab, then it contains events, groups, organizations, and shop screens
  - Given the Learn tab, then it contains coach, modules, and health education screens
  - Given the Profile tab, then it contains profile, settings, SafeDate, and vault screens
  - Given tab icons, then Discover uses a flame icon derived from the logo aesthetic

### FR-4: Web Header (Glassmorphism)
- Priority: Must
- Acceptance criteria:
  - Given the web app header, then it uses glassmorphism styling: rgba(44,36,33,0.85) background, backdrop-filter blur(12px) saturate(150%), subtle copper border-bottom
  - Given the header left side, then the Lustre logo PNG (32px height) and "Lustre" in Sohne are displayed
  - Given the header center, then 4 nav icons with labels (Discover, Connect, Explore, Learn) are displayed
  - Given the header right side, then a notification bell and avatar dropdown (Profile, Settings, SafeDate, Vault, Logout) are displayed
  - Given the header, then it is sticky with z-index 100

### FR-5: Card Component System
- Priority: Must
- Acceptance criteria:
  - Given any card component, then it uses no borders — depth is created via copper-tinted shadows
  - Given a card, then it has backgroundColor warmCream, borderRadius 16, and shadow with copperMuted tint
  - Given a discover swipe card, then it is fullscreen-style (90% width, 75% height) with the photo covering the entire card
  - Given a swipe card, then a gradient overlay from bottom shows name, age, and distance in white text
  - Given the swipe stack, then cards behind the current card are visible with z-index stacking and scale 0.95/0.90

### FR-6: Discover Screen (Reanimated)
- Priority: Must
- Acceptance criteria:
  - Given swipe gestures, then React Native Reanimated 3 is used instead of Animated.ValueXY
  - Given a card swipe, then rotation ranges from -15deg to +15deg (not ±10deg)
  - Given a swipe exceeding the threshold, then Like/Nope stamps appear with a glow effect
  - Given a card fly-off, then it completes in 200ms with spring physics
  - Given a card snap-back, then it uses withSpring(0, { damping: 20, stiffness: 90 })

### FR-7: Profile Redesign (Hinge Model)
- Priority: Must
- Acceptance criteria:
  - Given a profile view, then it is a scrollable full-screen page (not a grid of cards)
  - Given the profile layout, then photos are interspersed with prompt responses
  - Given any photo or prompt on a profile, then it has an individual "like" button (heart icon)
  - Given the bio section, then it uses 3 chosen prompts instead of free-text bio
  - Given a like on a specific prompt or photo, then a conversation can be started with that context

### FR-8: Animation System
- Priority: Should
- Acceptance criteria:
  - Given a match event, then a Lottie animation plays with haptic feedback and copper shimmer
  - Given any button press, then it scales to 0.95 with spring physics and haptic feedback
  - Given navigation transitions, then shared element transitions are used between screens
  - Given modals, then they use glassmorphism overlay with slide-up spring animation

### FR-9: Logo Integration
- Priority: Must
- Acceptance criteria:
  - Given the web header, then the logo PNG is displayed at 32px height
  - Given the mobile splash screen, then the logo is prominently displayed
  - Given the web favicon, then it uses a derived version of the logo

## Non-Functional Requirements (NFR)

- All animations must maintain 60fps on mid-range devices (Pixel 6a, iPhone 12)
- Glassmorphism limited to 3-5 elements per screen to avoid GPU strain
- Font loading must not cause visible FOUT (flash of unstyled text) — use font preloading
- Dark mode toggle must be instantaneous (no full re-render)
- Card swipe gesture must respond within 16ms (single frame)
- Bundle size increase from design changes must not exceed 200KB (fonts excluded from this limit)
- All new components must support both light and dark mode from day one

## MVP Scope

FR-1 through FR-7 are MVP. FR-8 (advanced animations beyond swipe) and FR-9 (logo integration) are Phase 2 but still in scope for this feature.

## Risks and Dependencies

- **Font licensing**: Sohne requires a Klim Type Foundry license (~$150-400). General Sans is the free fallback. Decision needed before Wave 1 starts.
- **Reanimated 3 migration**: Requires updating babel config for worklet compilation. May surface issues with existing Expo plugins.
- **Glassmorphism on Android**: backdrop-filter has inconsistent support on older Android WebViews. Web header must degrade gracefully.
- **Navigation restructure**: Consolidating 12 tabs to 5 requires updating deep links, push notification routes, and Expo Router file structure.
- **Dependency on F25**: Vanilla/Spicy mode colors (sage/ember) must integrate with the new palette without conflicts.
