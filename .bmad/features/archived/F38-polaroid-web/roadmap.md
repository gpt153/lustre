# Roadmap: F38 — Polaroid Design System for Web (Next.js)

**Status:** IN_PROGRESS — code complete, visual verification NOT done
**Created:** 2026-03-29
**Waves:** 4
**Depends on:** F37 Wave 1 (packages/tokens/polaroid.ts)
**Implementation source:** Stitch HTML reference files in `screenshots/stitch-reference/html/`

---

## Wave 1: Foundation (CSS tokens + Caveat font + PolaroidCard)

Build core PolaroidCard component and infrastructure. After this wave, standalone PolaroidCard renders with exact Polaroid 600 proportions, Caveat captions, hover effects, and stack variant.

**Status:** NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken

**Stitch source:** Any desktop HTML (tokens extraction), `desktop-discovery.html` (PolaroidCard reference)

### Testgate Wave 1:
- [x] `pnpm build` succeeds
- [x] `tsc --noEmit` passes in `apps/web/`
- [ ] Caveat CSS variable `--font-caveat` defined on `<html>`
- [ ] **VISUAL VERIFICATION at 280px width:**
  - Card aspect 88:107 → height/width = 1.216 ±0.01 → PASS/FAIL
  - Image aspect 79:77 → 0.975 ±0.01 → PASS/FAIL
  - Side border 5.11% → ~14.3px ±1px → PASS/FAIL
  - Bottom border 26.70% → ~74.8px ±3px → PASS/FAIL
  - Background #FFFFFF → rgb(255,255,255) → PASS/FAIL
  - Caption font Caveat → computed font-family → PASS/FAIL
- [ ] Hover: rotation returns to 0°, lifts, shadow increases
- [ ] Stack variant: two pseudo-element edges visible
- [ ] Reduced motion: instant transitions
- [ ] **Gate script:** `~/bin/verify-wave-screenshots.sh <feature-dir> 1` exits 0

**BLOCKING: Visual verification MUST pass with real data before this wave can be marked DONE.**

### Tasks:

**1a. Extract CSS Custom Properties from Stitch HTML → tokens.css**
- Source: `desktop-discovery.html` Tailwind config (colors, fonts, shadows, border-radius)
- Convert Stitch Tailwind tokens to CSS custom properties in `apps/web/styles/tokens.css` section "11. Polaroid Design System":
  - `--polaroid-card-aspect: 88 / 107`
  - `--polaroid-image-aspect: 79 / 77`
  - `--polaroid-border-side: 5.11%`
  - `--polaroid-border-top: 7.39%`
  - `--polaroid-border-bottom: 26.70%`
  - `--polaroid-bg: #FFFFFF`
  - `--polaroid-caption-color: #2C2421`
  - `--polaroid-shadow: 0 4px 16px rgba(0, 0, 0, 0.18)`
  - `--polaroid-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.25)`
  - `--polaroid-rotation: 0deg`
- Cross-reference Stitch `.polaroid-shadow` style and `surface-container-lowest` color for accuracy
- Visual output matches `desktop-discovery.html` token values

**1b. Convert Stitch font loading to Caveat via next/font/google**
- Source: `desktop-discovery.html` `<link>` font imports (Epilogue, Plus Jakarta Sans, Be Vietnam Pro, Caveat/Patrick Hand)
- Add Caveat via `next/font/google` in `apps/web/app/layout.tsx`
- Variable: `--font-caveat`, display: `swap`, preload: false, weights: [400, 700]
- Add to `<html>` className
- Visual output matches `desktop-discovery.html` handwritten font rendering

**1c. Convert desktop-discovery.html Polaroid cards to CSS Modules + React Server Components**
- Source: `desktop-discovery.html` — `.polaroid-frame`, `.polaroid-shadow`, `.bg-surface-container-lowest` card structure
- Convert Stitch Tailwind classes (`.polaroid-frame`, rotation transforms, hover transitions) to `PolaroidCard.module.css`:
  - `.card`: aspect-ratio, white bg, shadow, padding, rotation, spring transition
  - `.image`: aspect-ratio 79/77, object-fit cover, no border-radius
  - `.caption`: Caveat font, single line, centered, ellipsis overflow
  - `.card:hover`: straighten, lift -8px, shadow increase
  - `.stack`: ::before/::after pseudo-elements at different angles
  - `@media (prefers-reduced-motion)`: instant transitions
- PolaroidCard.tsx: Server Component compatible, props: imageUrl, imageAlt, caption?, rotation?, stack?, hoverable?, className?, children?, onClick?
- Visual output matches `desktop-discovery.html` design

---

## Wave 2: Discovery Integration (PolaroidMasonryGrid + browse page)

Replace current 2-column profile grid on /discover/browse with PolaroidMasonryGrid. Highest-impact visual change.

**Status:** NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken

**Stitch source:** `desktop-discovery.html`, `desktop-discovery-revised.html`, `desktop-feed-masonry.html`

### Testgate Wave 2:

**BLOCKING: Screenshots MUST show REAL DATA from seed-dev-users.ts**

- [ ] Seed data loaded (20 profiles)
- [ ] **Screenshot: /discover/browse at 1440px:**
  - White Polaroid frames → PASS/FAIL
  - Varied rotation angles → PASS/FAIL
  - Caveat captions with name+age → PASS/FAIL
  - Near-square image crop → PASS/FAIL
  - Action buttons ON Polaroid → PASS/FAIL
  - 4-column masonry → PASS/FAIL
- [ ] **Screenshot: 900px** → 3 columns
- [ ] **Screenshot: 599px** → 1 column
- [ ] **Hover screenshot:** card straightened, lifted
- [ ] Keyboard: arrow keys + L/P functional
- [ ] Empty/loading NOT valid screenshots
- [ ] **Gate script:** `~/bin/verify-wave-screenshots.sh <feature-dir> 2` exits 0

**BLOCKING: Visual verification MUST pass with real data before this wave can be marked DONE.**

### Tasks:

**2a. Convert desktop-discovery.html masonry layout to CSS Modules + React Server Components**
- Source: `desktop-discovery.html` — `.masonry-grid` (column-count, column-gap), `.masonry-item` (break-inside, margin-bottom, rotation transforms)
- Also reference: `desktop-feed-masonry.html` — masonry variant with 3-column layout and `.masonry-grid`/`.masonry-item` styles
- Convert Stitch Tailwind masonry classes to `PolaroidMasonryGrid.module.css`:
  - CSS columns: 4 at ≥1200px, 3 at ≥900px, 2 at ≥600px, 1 at <600px
  - `.item`: break-inside avoid, margin-bottom
  - 8 nth-child rotation variations (-5° to +5°) — match Stitch rotation values (`-rotate-[4deg]`, `rotate-[5deg]`, `-rotate-[2deg]`, `rotate-[3deg]`, etc.)
- Visual output matches `desktop-discovery.html` design

**2b. Convert desktop-discovery-revised.html browse page to React Server Components**
- Source: `desktop-discovery-revised.html` — full browse page layout with nav, header, grid, and card interactions
- Replace `styles.grid` with `<PolaroidMasonryGrid>`
- Replace `<ProfileCard>` with `<PolaroidCard>`:
  - imageUrl = profile.photos[0]
  - caption = `${displayName}, ${age}`
  - stack = true for first 3
  - Action buttons as children (ON the Polaroid)
- Preserve `useDiscoverKeyboard`
- Visual output matches `desktop-discovery-revised.html` design

**2c. Convert desktop-discovery.html ProfileCard to use PolaroidCard internally**
- Source: `desktop-discovery.html` — card structure with image, caption text, hover effects
- Refactor ProfileCard to use PolaroidCard internally
- Action buttons (pass/spark/like) in PolaroidCard children slot
- Retain accessibility: aria-label, keyboard, tabIndex
- Visual output matches `desktop-discovery.html` design

---

## Wave 3: Feed + Chat Integration

Feed post media as PolaroidCards, chat images as inline Polaroids.

**Status:** NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken

**Stitch source:** `desktop-feed.html`, `desktop-feed-revised.html`, `desktop-feed-masonry.html`, `desktop-chat-inbox.html`

### Testgate Wave 3:
- [ ] **Screenshot: /feed with photo posts:**
  - Media in Polaroid frames → PASS/FAIL
  - Image aspect near-square → PASS/FAIL
  - Caption in Caveat → PASS/FAIL
- [ ] Text-only posts unchanged
- [ ] **Screenshot: /chat with image message:**
  - Polaroid frame → PASS/FAIL
  - Slight rotation → PASS/FAIL
  - Timestamp visible → PASS/FAIL
- [ ] `pnpm build` succeeds
- [ ] **Gate script:** `~/bin/verify-wave-screenshots.sh <feature-dir> 3` exits 0

**BLOCKING: Visual verification MUST pass with real data before this wave can be marked DONE.**

### Tasks:

**3a. Convert desktop-feed-revised.html PostCard media to CSS Modules + React Server Components**
- Source: `desktop-feed-revised.html` — feed post cards with Polaroid-framed media, masonry layout, handwritten captions
- Also reference: `desktop-feed.html` — original feed layout structure
- Also reference: `desktop-feed-masonry.html` — masonry feed variant with `.polaroid-frame`, `.polaroid-shadow`, rotation transforms
- Convert Stitch feed card structure to `apps/web/components/feed/PostCard.tsx`:
  - media images → PolaroidCard wrapper
  - Single image: slight rotation
  - Multi-image: small PolaroidCards in row
  - Text-only posts unchanged
  - Feed action bar stays in current position
- Visual output matches `desktop-feed-revised.html` design

**3b. Convert desktop-chat-inbox.html image messages to CSS Modules + React Server Components**
- Source: `desktop-chat-inbox.html` — chat layout with message bubbles, inbox list, conversation view
- Convert Stitch chat image message structure to `apps/web/components/chat/MessageBubble.tsx`:
  - `type === 'IMAGE'` → PolaroidCard (max-width 240px)
  - Own messages: rotation 2°, other's: -2°
  - Reduced shadow
  - Timestamp below Polaroid
- Visual output matches `desktop-chat-inbox.html` design

---

## Wave 4: Profile + Match Integration

Profile photo gallery as scattered PolaroidCards, match modal with overlapping Polaroids.

**Status:** NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken

**Stitch source:** `desktop-profile-refined.html`, `desktop-profile-gallery.html`, `desktop-match.html`, `desktop-edit-profile.html`

### Testgate Wave 4:
- [ ] **Screenshot: /profile/[userId] gallery:**
  - Scattered Polaroid frames → PASS/FAIL
  - Varied rotation → PASS/FAIL
  - First photo stack effect → PASS/FAIL
  - Captions visible → PASS/FAIL
- [ ] Edit mode: empty Polaroid upload slot
- [ ] **Screenshot: Match modal:**
  - Two Polaroid frames (not circles) → PASS/FAIL
  - ±10° rotation → PASS/FAIL
  - Names in Caveat captions → PASS/FAIL
  - Cards overlap → PASS/FAIL
- [ ] Lightbox still works
- [ ] `pnpm build` succeeds
- [ ] **Gate script:** `~/bin/verify-wave-screenshots.sh <feature-dir> 4` exits 0

**BLOCKING: Visual verification MUST pass with real data before this wave can be marked DONE.**

### Tasks:

**4a. Convert desktop-profile-gallery.html PhotoGallery to CSS Modules + React Server Components**
- Source: `desktop-profile-gallery.html` — profile photo gallery with scattered Polaroid layout, varied rotations, captions
- Also reference: `desktop-profile-refined.html` — refined profile view with photo section and layout context
- Also reference: `desktop-edit-profile.html` — edit mode with upload slots and editable Polaroid frames
- Convert Stitch profile gallery structure to scattered PolaroidCards:
  - Scattered PolaroidCards replacing 3-column grid
  - First photo larger with stack variant
  - Varied rotation per nth-child
  - Lightbox on click preserved
  - Edit mode: empty Polaroid frame with dashed border + camera icon (from `desktop-edit-profile.html`)
- Visual output matches `desktop-profile-gallery.html` design

**4b. Convert desktop-match.html Modal to CSS Modules + React Server Components**
- Source: `desktop-match.html` — match celebration modal with overlapping Polaroid photos, names in Caveat, CTA buttons
- Convert Stitch match modal structure to PolaroidCard-based overlay:
  - Replace circular `.photoFrame` with PolaroidCards at ±10°
  - Cards overlap at center (negative margin)
  - Card width ~140px, caption: displayName in Caveat
  - Motion spring entrance animation
  - Keep heading, CTA buttons, glassmorphism
- Visual output matches `desktop-match.html` design
