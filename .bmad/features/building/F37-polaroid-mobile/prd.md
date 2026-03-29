# PRD: F37 — Polaroid Design System for Mobile

## Overview

Transform all photo surfaces in the Lustre mobile app from generic full-bleed cards to Polaroid 600 instant photo cards. Every photo — in discovery, feed, chat, profile, and match ceremony — renders inside a white-bordered Polaroid frame with handwritten caption, configurable rotation, and stack effects. This creates a tactile, vintage aesthetic that differentiates Lustre from every other dating app.

## Target Audience

All Lustre mobile app users (Expo/React Native). Web implementation is deferred to F38.

## Problem Statement

The current mobile UI uses generic full-bleed photo cards (SwipeCard, PostImageGallery, PhotoGallery) that look like every other dating app. The Lustre brand identity calls for a Polaroid instant photo aesthetic, but no component exists to enforce the Polaroid 600 proportions, white frame, caption area, or scattered-angle visual language.

## Functional Requirements

### FR-1: Polaroid Token Constants (`packages/tokens/polaroid.ts`)
- Priority: Must
- Acceptance criteria:
  - Exports `POLAROID` object with `CARD_ASPECT` (88/107), `IMAGE_ASPECT` (79/77), `BORDER_SIDE` (0.0511), `BORDER_TOP` (0.0739), `BORDER_BOTTOM` (0.2670), `IMAGE_WIDTH_RATIO` (0.8977)
  - Exports `getPolaroidDimensions(cardWidth: number)` function returning all computed dimensions
  - ZERO runtime dependencies (pure TS constants)
  - Re-exported from `packages/tokens/index.ts`

### FR-2: Caveat Font Loading
- Priority: Must
- Acceptance criteria:
  - `@expo-google-fonts/caveat` installed, `Caveat_400Regular` and `Caveat_700Bold` loaded in `packages/ui/src/fonts/expo-loader.ts`
  - Caveat renders correctly as the Polaroid caption font

### FR-3: PolaroidCard Component (`packages/ui/src/PolaroidCard.tsx`)
- Priority: Must
- Acceptance criteria:
  - Given `cardWidth` prop, renders with exact Polaroid 600 proportions (88:107 card, 79:77 image, 5.11% sides, 7.39% top, 26.70% bottom)
  - Image renders with `cover` resizing in the image area
  - Caption: one line of Caveat text centered in bottom white strip
  - Rotation via `transform: [{ rotate }]`
  - Shadow variants: `'sm' | 'md' | 'lg'`
  - Reanimated spring scale on press (0.97, spring back)
  - Children render as overlay on image area (for action buttons)

### FR-4: PolaroidStack Component (`packages/ui/src/PolaroidStack.tsx`)
- Priority: Must
- Acceptance criteria:
  - 2-3 card edges visible behind front card at varied angles
  - Behind-cards offset by ±2-4° rotation and slight scale reduction
  - Tap advances stack with spring animation

### FR-5: Discovery Screen Polaroid Integration
- Priority: Must
- Acceptance criteria:
  - Profiles render as PolaroidCard (not full-bleed SwipeCard)
  - Card centered vertically with prev/next cards peeking above/below
  - Caption: `displayName, age` in Caveat
  - Segment navigation (tap left/right) preserved
  - Swipe left/right for like/pass preserved
  - Ken Burns zoom within Polaroid image area
  - Action buttons ON the Polaroid
  - Story progress bar inside Polaroid frame
  - VoiceOver/TalkBack fallback functional

### FR-6: Feed Polaroid Integration
- Priority: Must
- Acceptance criteria:
  - Feed post photos render inside PolaroidCard
  - Multiple photos: horizontal scroll of PolaroidCards with scattered rotation
  - Like/action icons on white bottom strip
  - Caption: post text truncated to one line

### FR-7: Chat Polaroid Integration
- Priority: Must
- Acceptance criteria:
  - `type === 'IMAGE'` messages render as inline PolaroidCard (max 220px width)
  - Slight rotation ±1-2°
  - Caption: sender name or message text

### FR-8: Profile Photo Gallery Polaroid Integration
- Priority: Must
- Acceptance criteria:
  - Photos render as PolaroidCard stack with swipe gesture
  - Caption: personal quote or photo number

### FR-9: Match Ceremony Polaroid Integration
- Priority: Must
- Acceptance criteria:
  - Two overlapping PolaroidCards at ±8°
  - Names as captions
  - Spring entry animation + Skia particles + haptics

## Non-Functional Requirements

- **Performance:** PolaroidCard <16ms render. No Skia in card itself.
- **Memory:** PolaroidStack max 3 prerendered cards.
- **Accessibility:** accessibilityLabel on all cards. Caption readable by screen readers.
- **Animation:** SPRING configs from `apps/mobile/constants/animations.ts`. Reduced motion disables rotation/springs.
- **Type safety:** All props fully typed. cardWidth required.

## Design Rules (NEVER Violate)
- Bottom border NEVER larger than 26.70% of card width
- Image area NEVER smaller than 72% of card height
- NEVER more than one caption line
- NEVER place interaction buttons outside the Polaroid
- Card background ALWAYS pure white #FFFFFF
- Caption font ALWAYS Caveat

## Dependencies
- `@expo-google-fonts/caveat` (new)
- `react-native-reanimated` ~3.16.0 (existing)
- `react-native-gesture-handler` ~2.21.0 (existing)
