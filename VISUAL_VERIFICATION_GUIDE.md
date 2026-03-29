# Lustre — Visual Verification & Stitch Comparison Guide

This document describes the complete visual verification process for Lustre's Polaroid Design System implementation. It applies to **all features with UI changes**, with specific focus on **F37 (Polaroid Mobile)** and **F38 (Polaroid Web)**.

Any system building or testing Lustre UI code MUST follow these rules. A wave CANNOT be completed until visual verification passes.

---

## Table of Contents

1. [Polaroid 600 Design Spec](#1-polaroid-600-design-spec)
2. [Screenshot Storage & Organization](#2-screenshot-storage--organization)
3. [Image Size Limits](#3-image-size-limits)
4. [Stitch Reference Designs](#4-stitch-reference-designs)
5. [Visual Verification Process](#5-visual-verification-process)
6. [F37 Mobile — Wave-by-Wave Verification](#6-f37-mobile--wave-by-wave-verification)
7. [F38 Web — Wave-by-Wave Verification](#7-f38-web--wave-by-wave-verification)
8. [Seed Data Requirement](#8-seed-data-requirement)
9. [Comparison Checklist Template](#9-comparison-checklist-template)
10. [Failure Handling](#10-failure-handling)
11. [Tools & Scripts](#11-tools--scripts)

---

## 1. Polaroid 600 Design Spec

All photos in Lustre are rendered as Polaroid instant photo cards based on real Polaroid 600 film dimensions: 88 x 107mm total, 79 x 77mm image area.

### Diagram

```
┌─────────────────────────┐
│       6.5mm (7.39%)     │  ← Top border
│   ┌─────────────────┐   │
│   │                 │   │
│4.5│   79 x 77 mm    │4.5│  ← Side borders (5.11%)
│mm │   (image area)  │mm │
│   │                 │   │
│   └─────────────────┘   │
│      23.5mm (26.70%)    │  ← Bottom border (caption area)
└─────────────────────────┘
        88 x 107mm
```

### Mandatory Ratios

| Property | Value | Notes |
|---|---|---|
| Card aspect ratio | 88:107 (0.8224) | height/width = 1.2159 |
| Image width | 89.77% of card width | |
| Image aspect ratio | 79:77 (1.026:1) | Near-square, slightly wider than tall |
| Image height | 72% of card height | |
| Side border | 5.11% of card width | 4.5mm / 88mm |
| Top border | 7.39% of card width | 6.5mm / 88mm |
| Bottom border | 26.70% of card width | 23.5mm / 88mm |
| Bottom vs sides | 5.22x thicker | Characteristic Polaroid look |
| Bottom vs top | 3.62x thicker | |

### CSS Implementation (Web)

```css
.polaroid-card {
  aspect-ratio: 88 / 107;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  /* CSS padding-% is relative to element WIDTH */
  padding: 7.39% 5.11% 26.70% 5.11%;
}

.polaroid-image {
  width: 100%;
  aspect-ratio: 79 / 77;
  object-fit: cover;
}

.polaroid-caption {
  font-family: 'Caveat', 'Patrick Hand', cursive;
  font-size: 0.9rem;
  color: #2C2421;
  text-align: center;
  margin-top: auto;
}
```

**Important:** CSS `padding` percentages are always calculated relative to the element's **width**, not height. The values 7.39% / 5.11% / 26.70% / 5.11% correspond directly to the physical mm ratios.

### React Native Implementation (Mobile)

```tsx
const POLAROID = {
  CARD_ASPECT: 88 / 107,      // 0.8224
  IMAGE_ASPECT: 79 / 77,      // 1.026
  BORDER_SIDE: 0.0511,        // x card width
  BORDER_TOP: 0.0739,         // x card width
  BORDER_BOTTOM: 0.2670,      // x card width
  IMAGE_WIDTH_RATIO: 0.8977,  // x card width
} as const;

function getPolaroidDimensions(cardWidth: number) {
  return {
    cardWidth,
    cardHeight: cardWidth * (107 / 88),
    imageWidth: cardWidth * POLAROID.IMAGE_WIDTH_RATIO,
    imageHeight: cardWidth * (77 / 88),
    borderTop: cardWidth * POLAROID.BORDER_TOP,
    borderSide: cardWidth * POLAROID.BORDER_SIDE,
    borderBottom: cardWidth * POLAROID.BORDER_BOTTOM,
  };
}
```

### Expected Pixel Values at Common Card Widths

| Card width | Card height | Side border | Top border | Bottom border | Image width | Image height |
|---|---|---|---|---|---|---|
| 200px | 243.2px | 10.2px | 14.8px | 53.4px | 179.5px | 175.0px |
| 280px | 340.5px | 14.3px | 20.7px | 74.8px | 251.4px | 245.0px |
| 300px | 364.8px | 15.3px | 22.2px | 80.1px | 269.3px | 262.5px |
| 340px | 413.4px | 17.4px | 25.1px | 90.8px | 305.2px | 297.5px |

### NEVER DO

- Never make bottom border larger than 26.70% of card width
- Never make image area smaller than 72% of card height
- Never use more than one caption line
- Never place interactions outside the Polaroid card
- Never use cold colors (green, blue, grey) in backgrounds
- Never tile or repeat background patterns

### Brand Colors

| Color | Hex | Usage |
|---|---|---|
| Copper | #B87333 | Primary, CTAs, active states |
| Gold | #D4A843 | Secondary accents, highlights |
| Warm White | #FDF8F3 | Backgrounds |
| Charcoal | #2C2421 | Text, icons |
| Ember | #C85A3A | Tertiary, alerts, emphasis |

### Typography

| Context | Font |
|---|---|
| Headlines | Plus Jakarta Sans (or General Sans) |
| Body text | Inter |
| Polaroid captions | Caveat (primary), Patrick Hand (fallback), cursive (system fallback) |

---

## 2. Screenshot Storage & Organization

All screenshots are stored in the feature's directory under `.bmad/features/`.

### Directory Structure

```
.bmad/features/{status}/F{XX}-{feature-name}/screenshots/
  stitch-reference/          # Stitch design images (downloaded once, never overwritten)
    INDEX.md                 # Maps filenames to screen descriptions
    screen_<hash>.png        # Individual screen designs from Stitch
  wave1/
    run1/                    # First test run
      discovery.png
      feed.png
      ...
    run2/                    # After fix-epics, re-test
      discovery.png
      feed.png
      ...
  wave2/
    run1/
      ...
  wave3/
    ...
  wave4/
    ...
```

### Rules

- **First test run** for a wave goes in `run1/`
- If fixes are needed (fix-epics), re-test results go in `run2/`, `run3/`, etc.
- Each run directory captures the FULL state of every relevant screen
- **Never overwrite** a previous run — always create the next `runN/` directory
- **Never delete** Stitch reference images
- This creates a visual history: run1 -> fix -> run2 -> fix -> run3 showing iteration toward the design

### Naming Convention for Screenshots

Use descriptive, lowercase filenames:
- `discovery-main.png` — Discovery screen with profiles loaded
- `discovery-swipe.png` — Mid-swipe animation
- `feed-photo-posts.png` — Feed with photo posts visible
- `chat-image-message.png` — Chat with shared photo
- `profile-gallery.png` — Profile photo gallery
- `match-ceremony.png` — Match overlay with two Polaroids
- `polaroid-card-standalone.png` — Isolated component test

---

## 3. Image Size Limits

Large images cause AI assistants (including Claude) to hang or fail. **ALL screenshots MUST be resized before saving.**

### Limits

| Property | Maximum |
|---|---|
| Width | 800px |
| File size | 200KB per image |
| Format | PNG (optimized) |

### When to Resize

| Source | Typical raw size | Action |
|---|---|---|
| Stitch MCP `getImage()` | 512px wide, 30-170KB | Usually OK, verify |
| Android device screenshot | 1080-1440px wide, 500KB-2MB | MUST resize |
| iOS simulator screenshot | 1170-1290px wide, 1-4MB | MUST resize |
| Browser screenshot (Playwright/Chrome) | 1440px+ wide, 200KB-1MB | MUST resize |
| DevTools element screenshot | Varies | Check and resize if needed |

### Resize Script

Located at `~/bin/resize-screenshot.sh`:

```bash
# Single file
~/bin/resize-screenshot.sh screenshot.png

# All PNGs in a directory
~/bin/resize-screenshot.sh screenshots/wave1/run1/

# Custom max width (default 800)
~/bin/resize-screenshot.sh screenshot.png 600
```

The script uses Python Pillow (installed on this system). It:
- Resizes to max 800px wide (preserves aspect ratio)
- Applies Lanczos resampling for quality
- Optimizes PNG compression
- Prints before/after dimensions and file size
- Skips images already within limits

### Mandatory Workflow

1. Capture screenshot (device, browser, or tool)
2. **Immediately** run `~/bin/resize-screenshot.sh <file_or_dir>`
3. Verify file size < 200KB
4. Save to correct `screenshots/waveN/runM/` directory
5. Only THEN pass the image to Claude or any AI for comparison

**NEVER pass a raw device/browser screenshot to an AI system without resizing first.**

---

## 4. Stitch Reference Designs

### What is Stitch?

Google Stitch (stitch.withgoogle.com) is the AI design tool used to create Lustre's UI designs. Reference screenshots have been exported from Stitch and stored in each feature's `screenshots/stitch-reference/` directory.

### Stitch Projects

| Project | ID | Contents |
|---|---|---|
| Lustre Redesign v1 (iterations) | 1086044651106222720 | Early Polaroid explorations, proportions refined over multiple iterations |
| Lustre Full App v2 | 3228541579636523619 | Final app screens with correct Polaroid proportions |

### Stitch Design System

| Property | Value |
|---|---|
| Name | Lustre Polaroid System |
| Asset ID | 16173399879373693498 |
| Contents | Locked Polaroid 600 proportions, brand colors, typography |

### F37 Mobile Reference Screens

Located at `.bmad/features/planned/F37-polaroid-mobile/screenshots/stitch-reference/`

| File | Screen | Use in Wave |
|---|---|---|
| screen_c79ef44f839f4c74a18a96bfb8586615.png | Discovery — Polaroid Stack (vertical flow + buttons on card) | Wave 2 |
| screen_c9a3787b9ffa40dc8c0854cef635cdf4.png | Community Feed — Warm Cream + Polaroid | Wave 3 |
| screen_33ca0f4e28ac43e6a38edd83b39a0ec5.png | Profile — Enhanced Polaroid Stack | Wave 4 |
| screen_ae4e021f45ea4969a5d7d8110dee474d.png | Match — "It's a Connection!" overlapping Polaroids | Wave 4 |
| screen_aef97762b22d4215a4521d6e47d40a01.png | Onboarding / Welcome — scattered Polaroids | Reference only |
| screen_3471deb584ba42199a1241b1ae252a88.png | Edit Profile — Polaroid photo grid | Wave 4 |
| screen_a8e8ee8fe60d488db873d26a14849223.png | Chat Inbox — Polaroid avatars | Wave 3 |
| screen_a753a9dc440b4158bbd687ae242d4687.png | Chat Conversation — inline Polaroid photo | Wave 3 |

### F38 Web Reference Screens

Located at `.bmad/features/planned/F38-polaroid-web/screenshots/stitch-reference/`

| File | Screen | Use in Wave |
|---|---|---|
| screen_012e4fb9b2f649f3aa3d68667fdeb4a8.png | Discovery Grid — Masonry Polaroids (realistic proportions) | Wave 2 |
| screen_4cb0c1d9e75e4afdacfbd72771d3cd2f.png | Feed — Exact Polaroid 600 Proportions | Wave 3 |
| screen_ce3682b23c774b4a8186f29ecce23188.png | Profile — Scattered Polaroids + Sticky Notes | Wave 4 |
| screen_5158efbb53fb42edbe43aedc899e7248.png | Chat Inbox + Active Chat — 3-panel layout | Wave 3 |
| screen_a1aa7042a1854a12ae4eba1443ddfe3f.png | Match Modal — Overlapping Polaroids | Wave 4 |
| screen_fc0ecae0b5a1454ca15fe6cf7bb5eaae.png | Edit Profile — Polaroid gallery + form | Wave 4 |

---

## 5. Visual Verification Process

### Overview

Every wave that includes visual changes follows this process:

```
Build code -> Load seed data -> Take screenshots -> Resize images ->
Compare against Stitch -> Fill checklist -> ALL PASS? ->
  YES: Wave complete
  NO:  Fix issues -> re-test in next runN/ -> repeat
```

### Step-by-Step

#### Step 1: Build and Run

- Ensure code compiles: `pnpm build`
- Type-check: `tsc --noEmit`
- Start dev server (web: `pnpm dev`, mobile: Expo dev client)

#### Step 2: Load Seed Data

```bash
cd services/api
npx prisma db seed
```

This loads 20 user profiles with photos, bios, and posts. **If a screen shows a spinner, empty state, or placeholder instead of real content, the test FAILS immediately.** See [Section 8](#8-seed-data-requirement) for details.

#### Step 3: Take Screenshots

Capture every screen that was changed in this wave:
- **Mobile:** Use device screenshot or Expo dev tools
- **Web:** Use browser screenshot, Playwright `page.screenshot()`, or Chrome DevTools

#### Step 4: Resize Screenshots

```bash
~/bin/resize-screenshot.sh screenshots/waveN/runM/
```

Verify all files are under 200KB and max 800px wide.

#### Step 5: Compare Against Stitch Reference

For each screenshot, open the corresponding Stitch reference side-by-side and complete the verification checklist:

1. **Overall layout:** Does the screen match the Stitch design in terms of element placement, spacing, and visual hierarchy?
2. **Polaroid proportions:** Do all Polaroid cards follow the exact 88:107 ratio with correct border sizes?
3. **Typography:** Is Caveat used for captions? Are body fonts correct?
4. **Colors:** Does the background use Warm White #FDF8F3? Are brand colors correct?
5. **Interactions:** Are buttons/icons ON the Polaroid, never outside?
6. **Rotation/scatter:** Do cards have varied, natural-looking rotation?
7. **Stack effect:** Where applicable, do 2-3 card edges peek behind the main card?

#### Step 6: Fill Verification Checklist

Use the per-wave checklist (see sections 6 and 7 below). Format:

```
| Design rule | What is visible on screen | PASS/FAIL |
```

**ALL rules must PASS.** A single FAIL blocks the wave.

#### Step 7: Handle Failures

If any rule fails:
1. Identify the root cause (CSS value, component prop, layout issue)
2. Fix the code
3. Re-test into the next `runN/` directory
4. Re-compare against Stitch
5. Repeat until ALL PASS

---

## 6. F37 Mobile — Wave-by-Wave Verification

### Wave 1: Foundation

**What was built:** Polaroid token constants, Caveat font, PolaroidCard component, PolaroidStack component.

**Screenshots required:** PolaroidCard standalone + PolaroidStack with real seed user photo.

**Stitch reference:** No direct screen match (foundation components only). Verify proportions match the design spec.

#### Checklist

| # | Rule | Expected | How to Verify | PASS/FAIL |
|---|---|---|---|---|
| V1.1 | Card aspect ratio 88:107 | height/width = 1.216 ±0.02 | Measure card dimensions | |
| V1.2 | Image aspect ratio 79:77 | width/height = 1.026 ±0.02 | Measure image dimensions | |
| V1.3 | Side borders 5.11% | border/cardWidth = 0.051 ±0.01 | Pixel measurement | |
| V1.4 | Top border 7.39% | border/cardWidth = 0.074 ±0.01 | Pixel measurement | |
| V1.5 | Bottom border 26.70% | border/cardWidth = 0.267 ±0.02 | Pixel measurement | |
| V1.6 | Bottom 5.22x sides | Bottom visually ~5x side width | Visual comparison | |
| V1.7 | White background | Card background is #FFFFFF | Color picker | |
| V1.8 | Shadow visible | Soft drop shadow, not harsh | Visual check | |
| V1.9 | Caveat caption | Text is handwritten cursive style | Font check | |
| V1.10 | Stack peeking | 2 card edges visible behind main card | Visual check | |

**BLOCKING: ALL items must PASS with a real photo from seed data visible. Spinners/placeholders = automatic FAIL.**

---

### Wave 2: Discovery Integration

**What was built:** PolaroidProfileCard, Discovery stack with vertical flow, CopperPick Polaroid.

**Screenshots required (4):** Discovery main, prompt segment, mid-swipe, CopperPick.

**Stitch reference:** `screen_c79ef44f839f4c74a18a96bfb8586615.png` (Discovery — Polaroid Stack)

#### Checklist

| # | Rule | Expected | How to Verify | PASS/FAIL |
|---|---|---|---|---|
| V2.1 | Card aspect 88:107 | 1.216 ±0.02 | Measure | |
| V2.2 | Image near-square 79:77 | Not tall rectangles | Visual | |
| V2.3 | Bottom border 26.70% | Wide white strip with caption | Measure | |
| V2.4 | Caveat caption | Name+age in handwritten font | Font check | |
| V2.5 | Buttons ON card | Action icons within Polaroid bounds | Visual | |
| V2.6 | Progress bar inside | Story bar inside image area, top | Visual | |
| V2.7 | Prev/next peek | Adjacent cards visible with rotation | Visual | |
| V2.8 | Shadow present | Soft charcoal shadow | Visual | |
| V2.9 | Real photo loaded | Actual photo visible (not placeholder) | Visual | |
| V2.10 | Matches Stitch | Overall layout matches reference screen | Side-by-side | |

**Functional checks:** Swipe right=like, swipe left=pass, tap right=next segment, tap left=prev, long press=pause Ken Burns, VoiceOver/TalkBack works.

**BLOCKING: 20 seed profiles must be loaded. ALL visual items PASS.**

---

### Wave 3: Feed + Chat

**What was built:** Feed photos in PolaroidCards, chat IMAGE messages as inline Polaroids.

**Screenshots required (4):** Feed single-photo, feed multi-photo, chat sent photo, chat received photo.

**Stitch references:**
- `screen_c9a3787b9ffa40dc8c0854cef635cdf4.png` (Community Feed)
- `screen_a8e8ee8fe60d488db873d26a14849223.png` (Chat Inbox)
- `screen_a753a9dc440b4158bbd687ae242d4687.png` (Chat Conversation)

#### Checklist

| # | Rule | Expected | How to Verify | PASS/FAIL |
|---|---|---|---|---|
| V3.1 | Feed photo in Polaroid | White frame around photo | Visual | |
| V3.2 | Feed aspect 88:107 | Correct at 280px card width | Measure | |
| V3.3 | Scattered rotation | Multi-photo cards at different angles | Visual | |
| V3.4 | Feed actions ON card | Like/comment on or near bottom strip | Visual | |
| V3.5 | Feed caption | One line, Caveat font | Font check | |
| V3.6 | Chat photo in Polaroid | White frame around shared photo | Visual | |
| V3.7 | Chat fits bubble | Card width <= 220px, fits conversation | Measure | |
| V3.8 | Chat caption | Below photo in handwritten font | Visual | |
| V3.9 | Feed matches Stitch | Layout matches reference | Side-by-side | |
| V3.10 | Chat matches Stitch | Layout matches reference | Side-by-side | |

**Performance checks:** Feed scroll 10+ posts without dropped frames. Chat scroll 5+ inline Polaroids without dropped frames.

**BLOCKING: Photo posts and image messages must be visible with real data.**

---

### Wave 4: Profile + Match

**What was built:** Profile photo gallery as PolaroidStack, match ceremony with two overlapping Polaroids.

**Screenshots required (4):** Profile stack, edit mode, match ceremony, mid-animation.

**Stitch references:**
- `screen_33ca0f4e28ac43e6a38edd83b39a0ec5.png` (Profile — Enhanced Polaroid Stack)
- `screen_ae4e021f45ea4969a5d7d8110dee474d.png` (Match — Overlapping Polaroids)
- `screen_3471deb584ba42199a1241b1ae252a88.png` (Edit Profile)

#### Checklist

| # | Rule | Expected | How to Verify | PASS/FAIL |
|---|---|---|---|---|
| V4.1 | Profile stack | Front card + 1-2 peeking behind | Visual | |
| V4.2 | Profile aspect 88:107 | Correct proportions | Measure | |
| V4.3 | Profile swipe | Next photo springs into view | Interaction | |
| V4.4 | Profile caption | Caveat font, one line | Font check | |
| V4.5 | Match two cards | Two Polaroids overlapping at center | Visual | |
| V4.6 | Match +-8 degrees | Cards visually angled in opposite directions | Visual | |
| V4.7 | Match names | Captions show user names in Caveat | Font check | |
| V4.8 | Match animation | Spring entry from off-screen | Interaction | |
| V4.9 | Particles | Skia particles visible behind cards | Visual | |
| V4.10 | Edit mode | Delete overlay + empty Polaroid with "+" works | Interaction | |
| V4.11 | Profile matches Stitch | Layout matches reference | Side-by-side | |
| V4.12 | Match matches Stitch | Layout matches reference | Side-by-side | |

**BLOCKING: Seed user photos must be loaded. Match requires two matched profiles.**

---

## 7. F38 Web — Wave-by-Wave Verification

### Wave 1: Foundation

**What was built:** CSS custom properties (tokens.css), Caveat font via next/font/google, PolaroidCard component (CSS Module + TSX).

**Screenshots required:** PolaroidCard standalone at 280px width, hover state, stack variant.

**Stitch reference:** No direct screen match (foundation components only).

#### Checklist

| # | Rule | Expected at 280px width | How to Verify | PASS/FAIL |
|---|---|---|---|---|
| V1.1 | Card aspect 88:107 | height = 340.5px ±2px | DevTools computed | |
| V1.2 | Image aspect 79:77 | h=243.5px at w=251.4px ±2px | DevTools computed | |
| V1.3 | Side border 5.11% | 14.3px ±1px | DevTools padding | |
| V1.4 | Top border 7.39% | 20.7px ±1px | DevTools padding | |
| V1.5 | Bottom border 26.70% | 74.8px ±3px | DevTools padding | |
| V1.6 | Background #FFFFFF | rgb(255,255,255) | Computed style | |
| V1.7 | Caption font Caveat | font-family starts with "Caveat" | Computed style | |
| V1.8 | Shadow present | box-shadow matches spec | Computed style | |
| V1.9 | Hover: straighten | rotation -> 0deg on hover | DevTools | |
| V1.10 | Hover: lift | translateY(-8px) on hover | DevTools | |
| V1.11 | Stack variant | ::before/::after pseudo-elements visible | Visual | |
| V1.12 | Reduced motion | transition-duration: 0ms | Emulate in DevTools | |

**BLOCKING: Verified with real image, not placeholder.**

---

### Wave 2: Discovery Integration

**What was built:** PolaroidMasonryGrid, /discover/browse refactored to Polaroid cards.

**Screenshots required (4):** 1440px (4 columns), 900px (3 columns), 599px (1 column), hover state.

**Stitch reference:** `screen_012e4fb9b2f649f3aa3d68667fdeb4a8.png` (Discovery Grid — Masonry)

#### Checklist

| # | Rule | Expected | How to Verify | PASS/FAIL |
|---|---|---|---|---|
| V2.1 | White Polaroid frames | Every profile card has white border | Visual | |
| V2.2 | Varied rotation | Cards tilted at different angles | Visual | |
| V2.3 | Near-square image | Not tall rectangles (79:77 ratio) | Visual | |
| V2.4 | Caveat captions | Handwritten name+age | Font check | |
| V2.5 | Actions ON Polaroid | Buttons/icons within card bounds | Visual | |
| V2.6 | 4-column masonry (1440px) | 4 staggered columns | Screenshot | |
| V2.7 | 3-column masonry (900px) | 3 staggered columns | Screenshot | |
| V2.8 | 1-column layout (599px) | Single Polaroid per row | Screenshot | |
| V2.9 | Stack on featured | First 3 profiles have peeking edges | Visual | |
| V2.10 | Hover state | Card straightens, lifts, shadow increases | Screenshot | |
| V2.11 | Keyboard navigation | Arrow keys + L/P functional | Interaction | |
| V2.12 | Matches Stitch | Overall layout matches reference | Side-by-side | |

**BLOCKING: 20 seed profiles loaded. Empty/loading screens = FAIL. Screenshots at all 3 breakpoints required.**

---

### Wave 3: Feed + Chat

**What was built:** Feed post photos in PolaroidCards, chat image messages as inline Polaroids.

**Screenshots required (2):** /feed with photo posts, /chat with image message.

**Stitch references:**
- `screen_4cb0c1d9e75e4afdacfbd72771d3cd2f.png` (Feed)
- `screen_5158efbb53fb42edbe43aedc899e7248.png` (Chat 3-panel)

#### Checklist

| # | Rule | Expected | How to Verify | PASS/FAIL |
|---|---|---|---|---|
| V3.1 | Feed media in Polaroid | White frame around photos | Visual | |
| V3.2 | Image aspect near-square | 79:77, not tall rectangles | Visual | |
| V3.3 | Caption in Caveat | Handwritten font below image | Font check | |
| V3.4 | Text-only unchanged | No Polaroid frame on text posts | Visual | |
| V3.5 | Chat Polaroid frame | White frame on image messages | Visual | |
| V3.6 | Chat slight rotation | Sent: 2deg, received: -2deg | Visual | |
| V3.7 | Chat max-width 240px | Fits in conversation layout | DevTools | |
| V3.8 | Timestamp visible | Time shown below Polaroid | Visual | |
| V3.9 | Feed matches Stitch | Layout matches reference | Side-by-side | |
| V3.10 | Chat matches Stitch | Layout matches reference | Side-by-side | |

**BLOCKING: Photo posts and image messages must show real content.**

---

### Wave 4: Profile + Match

**What was built:** Profile photo gallery as scattered Polaroids, match modal with overlapping Polaroids.

**Screenshots required (2):** /profile/[userId] gallery, match modal.

**Stitch references:**
- `screen_ce3682b23c774b4a8186f29ecce23188.png` (Profile — Scattered)
- `screen_a1aa7042a1854a12ae4eba1443ddfe3f.png` (Match Modal)
- `screen_fc0ecae0b5a1454ca15fe6cf7bb5eaae.png` (Edit Profile)

#### Checklist

| # | Rule | Expected | How to Verify | PASS/FAIL |
|---|---|---|---|---|
| V4.1 | Scattered gallery | Photos at varied rotation angles | Visual | |
| V4.2 | Primary stack | First photo has peeking card edges | Visual | |
| V4.3 | Lightbox works | Click opens full-size image | Interaction | |
| V4.4 | Captions visible | Caveat font, one line | Font check | |
| V4.5 | Match two Polaroids | Rectangular cards (NOT circles) | Visual | |
| V4.6 | Match +-10 degrees | Cards angled in opposite directions | Visual | |
| V4.7 | Names in Caveat | Handwritten captions | Font check | |
| V4.8 | Cards overlap | Negative margin, center overlap visible | Visual | |
| V4.9 | Spring animation | Entrance from sides with spring ease | Interaction | |
| V4.10 | Edit mode | Empty Polaroid frame with dashed border + camera icon | Visual | |
| V4.11 | Profile matches Stitch | Layout matches reference | Side-by-side | |
| V4.12 | Match matches Stitch | Layout matches reference | Side-by-side | |

**BLOCKING: Seed profile photos loaded. Match modal with two matched profiles.**

---

## 8. Seed Data Requirement

### Why

Empty screens, spinners, loading states, and placeholder images are **NEVER** valid test results. If a screen cannot show real data, the test fails — regardless of whether the code is "correct."

### How to Load

```bash
cd /home/samuel/lustre/services/api
npx prisma db seed
```

### What Seed Data Provides

The seed script (`services/api/prisma/seed-dev-users.ts`) creates:
- **20 user profiles** with photos, bios, ages, locations
- **Posts** with images and text
- **Chat messages** (verify image messages exist or create them)
- **Match data** for testing match ceremony

### Pre-Flight Check Before Any Visual Test

1. API server running: `curl http://localhost:3111/health`
2. Seed data loaded: verify profiles exist via API or direct DB check
3. Mobile/web app loads without errors
4. Navigate to the screen being tested
5. **Confirm real data is visible** (photos, names, text)
6. ONLY THEN take the screenshot

### If Data is Missing

If the seed script doesn't include data needed for a specific screen (e.g., chat image messages), you MUST:
1. Add the missing seed data to the seed script
2. Re-run the seed
3. This is part of the wave's work, not something to skip

---

## 9. Comparison Checklist Template

Use this template for any screen comparison:

```markdown
### Visual Comparison: [Screen Name]

**Wave:** N | **Run:** M | **Date:** YYYY-MM-DD

**Screenshot:** screenshots/waveN/runM/[filename].png
**Stitch reference:** screenshots/stitch-reference/screen_[hash].png

| # | Design Rule | What is Visible | PASS/FAIL |
|---|---|---|---|
| 1 | Polaroid card aspect 88:107 | [describe] | |
| 2 | Image area near-square 79:77 | [describe] | |
| 3 | Side borders 5.11% of card width | [describe] | |
| 4 | Top border 7.39% of card width | [describe] | |
| 5 | Bottom border 26.70% of card width | [describe] | |
| 6 | Background Warm White #FDF8F3 | [describe] | |
| 7 | Caption in Caveat font | [describe] | |
| 8 | Interactions ON Polaroid (not outside) | [describe] | |
| 9 | Brand colors (Copper/Gold/Charcoal) | [describe] | |
| 10 | Overall layout matches Stitch reference | [describe] | |

**Result:** ALL PASS / FAIL (items: ...)
**Action:** Wave complete / Fix required: [describe fixes]
```

---

## 10. Failure Handling

### Single Item Fails

1. Identify the CSS property, component prop, or layout rule causing the failure
2. Fix the code
3. Re-build and re-test
4. Save new screenshots in the next `runN/` directory
5. Re-fill the complete checklist (not just the failed item)
6. Continue until ALL PASS

### Pre-existing Blocker

If a screen can't render correctly because of a pre-existing issue (missing backend endpoint, broken API, missing seed data, etc.):

**DO NOT SKIP THE WAVE.**

Fix the blocker as part of the current wave. This is explicit policy:

> "BLOCKING: If a pre-existing issue (missing backend, no data, broken API) prevents correct rendering, it MUST be fixed as part of this wave — not skipped."

### Multiple Consecutive Failures

If `run3` or later still fails on the same items:
1. Re-read the Stitch reference design carefully
2. Re-read `POLAROID_DESIGN_SYSTEM.md` for exact values
3. Check if the issue is in the component itself or in how it's used
4. Consider whether the Stitch design needs to be re-generated (rare)

---

## 11. Tools & Scripts

### Screenshot Resize

```bash
~/bin/resize-screenshot.sh <file_or_directory> [max_width]
```

- Default max width: 800px
- Uses Python Pillow (pre-installed)
- Processes PNG files in-place
- Prints before/after dimensions and size

### Stitch MCP Tools

Available via MCP server `stitch`:

| Tool | Purpose |
|---|---|
| `fetch_screen_image` | Download PNG of a Stitch screen |
| `fetch_screen_code` | Get HTML of a Stitch screen |
| `list_screens` | List all screens in a project |
| `get_project` | Get project metadata |
| `generate_screen_from_text` | Generate new screen from description |
| `edit_screens` | Modify existing screen |
| `generate_variants` | Create REFINE/EXPLORE/REIMAGINE variants |

### Stitch SDK

Located at `/home/samuel/stitch-workspace/`:

```javascript
import { Stitch } from '@google/stitch-sdk';
const stitch = new Stitch();

// Get screen image
const screen = await project.getScreen(screenId);
const imageBuffer = await screen.getImage();
```

### Chrome DevTools MCP

For web verification, use Chrome DevTools MCP tools:
- `take_screenshot` — capture current page
- `evaluate_script` — measure computed styles
- `emulate` — test responsive breakpoints
- `resize_page` — set exact viewport dimensions

### Playwright MCP

Alternative browser automation:
- `browser_take_screenshot` — capture screenshot
- `browser_navigate` — go to URL
- `browser_resize` — set viewport
- `browser_evaluate` — run JS for measurements

---

## Summary of Blocking Rules

1. **EVERY wave with visual changes** requires screenshot verification
2. **ALL checklist items** must PASS — a single FAIL blocks the wave
3. **Real seed data** must be visible — empty screens are never valid
4. **Screenshots must be resized** to max 800px / 200KB before saving or sharing
5. **Screenshots are saved permanently** in `screenshots/waveN/runM/` — never overwritten
6. **Stitch comparison** is mandatory — overall layout must match the reference design
7. **Pre-existing blockers** must be fixed in the current wave, not skipped
8. **This applies to ALL features with UI changes** — not just Polaroid

These rules are permanent and non-negotiable.
