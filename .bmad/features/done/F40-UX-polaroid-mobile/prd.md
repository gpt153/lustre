# PRD: F40-UX-polaroid-mobile — Polaroid Design System for Mobile

## Overview

Transform Lustre's mobile app (Expo/React Native) to use the Polaroid 600 instant photo aesthetic across all screens. Every photo in the app — profiles, feed posts, chat images, avatars, match ceremony — is rendered as a Polaroid card with exact 88:107 proportions, warm copper-cream color palette, and handwritten Caveat captions.

This feature is a **complete replacement** for F37-polaroid-mobile, built from scratch using Stitch HTML as the implementation starting point.

## Problem

The current mobile app uses generic card layouts and circular avatars that look like every other dating app. There is no visual differentiation. The Polaroid design system creates a distinctive, tactile aesthetic that signals authenticity and warmth — core Lustre brand values.

## Goals

1. Convert all 11 Stitch mobile screen designs to Tamagui/React Native components
2. Enforce exact Polaroid 600 proportions (88:107 card, 79:77 image area) on all photo displays
3. Use the Material 3 copper color scheme from Stitch with warm charcoal shadows
4. Implement Caveat handwritten font for all Polaroid captions
5. Replace circular avatars with mini Polaroid avatars in chat inbox
6. Build the match ceremony with two overlapping Polaroids at +-8 degrees
7. Ensure 60fps performance on mid-range Android devices

## Non-Goals

- Web implementation (covered by F38)
- Backend/API changes
- New features or screens not in the Stitch designs
- Dark mode (can be added later)

## Stitch Reference

- **Project v1:** 1086044651106222720 (iterations — 6 screens)
- **Project v2:** 3228541579636523619 (final app — 5 screens)
- **Design System:** Lustre Polaroid System (asset 16173399879373693498)
- **HTML files:** 11 screens downloaded at `screenshots/stitch-reference/html/`
- **PNG references:** 11 images at `screenshots/stitch-reference/`
- **Analysis:** `stitch-analysis.md`

## Technical Approach

### Conversion Strategy: Stitch HTML to Tamagui

1. **Design tokens** → `packages/tokens/polaroid.ts` (colors, spacing, proportions from Stitch analysis)
2. **Shared components** → `packages/ui/src/` (PolaroidCard, PolaroidStack, PolaroidAvatar)
3. **Screen components** → `packages/app/src/` (screen-specific Polaroid layouts)
4. **Mobile integration** → `apps/mobile/` (route screens, gestures, animations)

### Key Dependencies

- `@shopify/react-native-skia` — particle effects, ambient gradients
- `react-native-reanimated` 3 — spring physics, gesture animations
- `react-native-gesture-handler` 2 — swipe/pan gestures
- `expo-font` — Caveat font loading
- Existing Tamagui config at `packages/ui/src/tamagui.config.ts`

### Seed Data Requirements

All visual verification requires the 20-user seed data loaded via `cd services/api && npx prisma db seed`. The seed includes profile photos, posts with images, and chat messages.

## Success Criteria

1. All 11 Stitch screens have equivalent React Native implementations
2. Polaroid cards measure within +-2% of 88:107 aspect ratio
3. Bottom border is visually ~5x thicker than side borders
4. Caveat font renders on both iOS and Android
5. Discovery swipe is smooth at 60fps
6. Chat inline Polaroids fit within message bubbles
7. Match ceremony shows two overlapping Polaroids with spring animation
8. Visual verification passes for all waves against Stitch reference images

## Risks

| Risk | Mitigation |
|---|---|
| Caveat font not available on Android | Bundle via expo-font, test on real device |
| Performance with many Polaroid shadows | Use elevation on Android, shadowLayer on iOS, limit shadow complexity |
| Gesture conflicts (swipe card vs scroll) | Use Gesture.Race/Gesture.Simultaneous from RNGH |
| Existing component API changes | Keep backwards-compatible props, add Polaroid variants |
