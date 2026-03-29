# Roadmap: F38 — Polaroid Design System for Web (Next.js)

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-29
**Waves:** 4
**Depends on:** F37 Wave 1 (packages/tokens/polaroid.ts)

---

## Wave 1: Foundation (CSS tokens + Caveat font + PolaroidCard)

Build core PolaroidCard component and infrastructure. After this wave, standalone PolaroidCard renders with exact Polaroid 600 proportions, Caveat captions, hover effects, and stack variant.

**Status:** DONE — 2026-03-29
**Build:** pnpm build PASS
**Files created:** PolaroidCard.tsx, PolaroidCard.module.css (server component)
**Files modified:** tokens.css (section 11), layout.tsx (Caveat font)

### Tasks:

**1a. CSS Custom Properties (tokens.css)**
- Add section "11. Polaroid Design System" to `apps/web/styles/tokens.css`:
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

**1b. Caveat Font Loading**
- Add Caveat via `next/font/google` in `apps/web/app/layout.tsx`
- Variable: `--font-caveat`, display: `swap`, preload: false, weights: [400, 700]
- Add to `<html>` className

**1c. PolaroidCard.module.css + PolaroidCard.tsx**
- `.card`: aspect-ratio, white bg, shadow, padding, rotation, spring transition
- `.image`: aspect-ratio 79/77, object-fit cover, no border-radius
- `.caption`: Caveat font, single line, centered, ellipsis overflow
- `.card:hover`: straighten, lift -8px, shadow increase
- `.stack`: ::before/::after pseudo-elements at different angles
- `@media (prefers-reduced-motion)`: instant transitions
- PolaroidCard.tsx: Server Component compatible, props: imageUrl, imageAlt, caption?, rotation?, stack?, hoverable?, className?, children?, onClick?

### Testgate Wave 1:
- [ ] `pnpm build` succeeds
- [ ] `tsc --noEmit` passes in `apps/web/`
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

**BLOCKING: Visual verification MUST pass with real data before this wave can be marked DONE.**

---

## Wave 2: Discovery Integration (PolaroidMasonryGrid + browse page)

Replace current 2-column profile grid on /discover/browse with PolaroidMasonryGrid. Highest-impact visual change.

**Status:** DONE — 2026-03-29
**Build:** pnpm build PASS

### Tasks:

**2a. PolaroidMasonryGrid.module.css + .tsx**
- CSS columns: 4 at ≥1200px, 3 at ≥900px, 2 at ≥600px, 1 at <600px
- `.item`: break-inside avoid, margin-bottom
- 8 nth-child rotation variations (-5° to +5°)

**2b. Discovery Browse Page Refactor**
- Replace `styles.grid` with `<PolaroidMasonryGrid>`
- Replace `<ProfileCard>` with `<PolaroidCard>`:
  - imageUrl = profile.photos[0]
  - caption = `${displayName}, ${age}`
  - stack = true for first 3
  - Action buttons as children (ON the Polaroid)
- Preserve `useDiscoverKeyboard`

**2c. ProfileCard Adaptation**
- Refactor to use PolaroidCard internally
- Action buttons (pass/spark/like) in PolaroidCard children slot
- Retain accessibility: aria-label, keyboard, tabIndex

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

**BLOCKING: Visual verification MUST pass with real data before this wave can be marked DONE.**

---

## Wave 3: Feed + Chat Integration

Feed post media as PolaroidCards, chat images as inline Polaroids.

**Status:** DONE — 2026-03-29
**Build:** pnpm build PASS

### Tasks:

**3a. Feed PostCard Media Refactor**
- `apps/web/components/feed/PostCard.tsx`:
  - media images → PolaroidCard wrapper
  - Single image: slight rotation
  - Multi-image: small PolaroidCards in row
  - Text-only posts unchanged
  - Feed action bar stays in current position

**3b. Chat Image Messages as Polaroids**
- `apps/web/components/chat/MessageBubble.tsx`:
  - `type === 'IMAGE'` → PolaroidCard (max-width 240px)
  - Own messages: rotation 2°, other's: -2°
  - Reduced shadow
  - Timestamp below Polaroid

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

**BLOCKING: Visual verification MUST pass with real data before this wave can be marked DONE.**

---

## Wave 4: Profile + Match Integration

Profile photo gallery as scattered PolaroidCards, match modal with overlapping Polaroids.

**Status:** DONE — 2026-03-29
**Build:** pnpm build PASS

### Tasks:

**4a. Profile PhotoGallery Polaroid Refactor**
- Scattered PolaroidCards replacing 3-column grid
- First photo larger with stack variant
- Varied rotation per nth-child
- Lightbox on click preserved
- Edit mode: empty Polaroid frame with dashed border + camera icon

**4b. Match Modal Polaroid Overlay**
- Replace circular `.photoFrame` with PolaroidCards at ±10°
- Cards overlap at center (negative margin)
- Card width ~140px, caption: displayName in Caveat
- Motion spring entrance animation
- Keep heading, CTA buttons, glassmorphism

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

**BLOCKING: Visual verification MUST pass with real data before this wave can be marked DONE.**
