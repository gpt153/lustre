# PRD: F38 — Polaroid Design System for Web (Next.js)

## Overview

Implement the Lustre Polaroid Design System across the Next.js web app. Every photo surface — discovery cards, feed posts, chat images, profile galleries, and match celebrations — renders inside a Polaroid 600-proportioned white frame with handwritten Caveat captions, scattered rotation angles, and stack effects.

## Target Audience

All Lustre web users. Depends on F37 Wave 1 for shared tokens.

## Problem Statement

The current web app uses generic card layouts (rounded corners, dark elevated backgrounds, no white frames). ProfileCard in discovery is a full-bleed photo with gradient overlay. PostCard in feed is a standard container. PhotoGallery on profiles is a simple grid. None match the Polaroid 600 design language.

## Dependencies

- **F37 Wave 1 (BLOCKING):** Creates `packages/tokens/polaroid.ts` with shared constants
- **Caveat font:** Added via `next/font/google` in `apps/web/app/layout.tsx`
- **CSS custom properties:** New Polaroid tokens in `apps/web/styles/tokens.css`

## Functional Requirements

### FR-1: PolaroidCard CSS Component
- Priority: Must
- Card aspect-ratio 88/107, image 79/77, padding matching Polaroid 600 borders
- White background (#FFFFFF) regardless of theme
- Caveat caption, single line, centered in bottom strip
- CSS custom property `--polaroid-rotation` for rotation
- Hover: straighten to 0°, lift, shadow increase, spring transition
- Stack variant: ::before/::after pseudo-elements for peeking cards

### FR-2: PolaroidMasonryGrid Component
- Priority: Must
- CSS-column masonry layout
- nth-child rotation rules (-6° to +6°)
- Responsive: 4 → 3 → 2 → 1 columns

### FR-3: Discovery Integration
- Priority: Must
- /discover/browse: PolaroidMasonryGrid of PolaroidCards
- Caption: displayName + age in Caveat
- Action buttons ON the Polaroid
- Keyboard navigation (arrow keys, L/P) preserved

### FR-4: Feed Integration
- Priority: Must
- Post media images as PolaroidCards
- Text-only posts unchanged

### FR-5: Chat Integration
- Priority: Must
- `type === 'IMAGE'` messages as inline PolaroidCards (max 240px)
- Slight rotation, reduced shadow

### FR-6: Profile Gallery Integration
- Priority: Must
- Scattered PolaroidCards with varied rotation
- Lightbox on click preserved

### FR-7: Match Modal Integration
- Priority: Must
- Two overlapping PolaroidCards at ±10°
- Spring entry animation via Motion
- Replace current circular photo frames

## Non-Functional Requirements

- **Performance:** CSS-only base rendering. Masonry via CSS columns.
- **Accessibility:** Alt text preserved. `prefers-reduced-motion` disables transitions.
- **Theme:** Card always white. Works in both dark/light themes.
- **Bundle:** Caveat via next/font/google (self-hosted). PolaroidCard is CSS Module only.

## Design Rules (NEVER Violate)
- Bottom border NEVER larger than 26.70% of card width
- Image area NEVER smaller than 72% of card height
- NEVER more than one caption line
- Card background ALWAYS #FFFFFF
- Caption font ALWAYS Caveat
