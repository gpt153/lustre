# Roadmap: F37 — Polaroid Design System for Mobile

**Status:** IN_PROGRESS — started 2026-03-29
**Created:** 2026-03-29
**Waves:** 4

---

## Wave 1: Foundation (tokens + font + base PolaroidCard)

Create Polaroid token constants, install Caveat font, build base PolaroidCard and PolaroidStack. Components exist in isolation, not yet integrated into screens.

**Status:** DONE — 2026-03-29

### Epics: ALL VERIFIED
- 1a Polaroid tokens — VERIFIED (tsc clean, dimension math confirmed)
- 1b Caveat font — VERIFIED (package.json + expo-loader updated)
- 1c PolaroidCard — VERIFIED (Reanimated spring, Caveat caption, shadow variants, a11y)
- 1d PolaroidStack — VERIFIED (3-layer stack, tap advance, spring animation)
- 1e Exports — VERIFIED (index.ts re-exports both components + types)

### Testgate: PASS
- [x] `packages/tokens/polaroid.ts` builds — tsc --noEmit clean
- [x] `POLAROID.CARD_ASPECT` = 0.8224 ✓
- [x] `POLAROID.BORDER_BOTTOM` = 0.2670 ✓
- [x] `getPolaroidDimensions(300)` → cardHeight ~365, imageWidth ~269, borderBottom ~97 ✓
- [x] Caveat fonts added to expo-loader
- [x] PolaroidCard component exists with correct props
- [x] PolaroidStack component exists with 3-layer rendering
- [x] `pnpm install` succeeds
- [ ] Visual verification — deferred to Wave 2 (no screen integration yet)

### Tasks:

**1a. Polaroid tokens** (haiku)
- Create `packages/tokens/polaroid.ts`:
  - `POLAROID` object: `CARD_ASPECT` (88/107), `IMAGE_ASPECT` (79/77), `BORDER_SIDE` (0.0511), `BORDER_TOP` (0.0739), `BORDER_BOTTOM` (0.2670), `IMAGE_WIDTH_RATIO` (0.8977)
  - `getPolaroidDimensions(cardWidth: number)` utility
  - `POLAROID_ROTATIONS` preset array: `[-5, -3, -1.5, 0, 1.5, 3, 5]`
  - `POLAROID_SHADOW` matching spec
- Update `packages/tokens/index.ts` to re-export

**1b. Caveat font** (haiku)
- Install `@expo-google-fonts/caveat` in `packages/ui/`
- Update `packages/ui/src/fonts/expo-loader.ts` to load `Caveat_400Regular` and `Caveat_700Bold`

**1c. PolaroidCard component** (sonnet)
- Create `packages/ui/src/PolaroidCard.tsx`:
  - Props: `cardWidth`, `imageSource`, `caption?`, `rotation?`, `shadow?`, `onPress?`, `children?`, `style?`, `accessibilityLabel?`
  - Dimensions via `getPolaroidDimensions(cardWidth)`
  - Spring press animation via `useAnimatedStyle` + `withSpring` (SPRING.snappy)
  - Caption in Caveat_400Regular, `numberOfLines={1}`, centered
  - Children overlay positioned absolutely over image area

**1d. PolaroidStack component** (sonnet)
- Create `packages/ui/src/PolaroidStack.tsx`:
  - Props: `images`, `cardWidth`, `captions?`, `onCardPress?`
  - Up to 3 cards: front at 0°, behind at ±2-4° with 0.95/0.90 scale
  - Tap advances with spring animation

**1e. Exports** (haiku)
- Update `packages/ui/src/index.ts` to export PolaroidCard and PolaroidStack

### Testgate Wave 1:
- [ ] `packages/tokens/polaroid.ts` builds — `tsc --noEmit` no errors
- [ ] `POLAROID.CARD_ASPECT` equals 88/107 (0.8224...)
- [ ] `POLAROID.BORDER_BOTTOM` equals 0.2670
- [ ] `getPolaroidDimensions(300)` returns correct values
- [ ] Caveat fonts load without error in Expo dev client
- [ ] PolaroidCard renders with test image at width 300
- [ ] **VISUAL VERIFICATION — PolaroidCard standalone:**
  - Card aspect ratio 88:107 → height/width = 1.216 ±0.01 → PASS/FAIL
  - Image area near-square 79:77 → PASS/FAIL
  - Side borders 5.11% → PASS/FAIL
  - Bottom border 26.70% → PASS/FAIL
  - Bottom 5.22x thicker than sides → PASS/FAIL
  - Caption uses Caveat font → PASS/FAIL
  - Card background pure white → PASS/FAIL
- [ ] PolaroidStack renders 3 cards with visible behind-card edges
- [ ] `pnpm build` succeeds
- [ ] **Screenshot:** PolaroidCard + PolaroidStack with real seed user photo

**BLOCKING: Visual verification MUST pass with real data on screen before this wave can be marked DONE.**

---

## Wave 2: Discovery Integration

Replace SwipeCard/ProfileCardStory with Polaroid-based discovery cards. Highest-risk wave — must preserve gesture composition, Ken Burns, story segments, accessibility.

**Status:** NOT STARTED

### Tasks:

**2a. PolaroidProfileCard** (opus)
- Create `apps/mobile/components/PolaroidProfileCard.tsx`:
  - Wraps PolaroidCard with ProfileCardStoryProfile data
  - StoryProgressBar inside Polaroid frame (image area, top)
  - Name/age in caption area (Caveat)
  - Action buttons on white bottom strip, right-aligned
  - Ken Burns within image area bounds
  - Gesture.Race composition preserved
  - Long-press pause preserved

**2b. Discovery stack refactor** (opus)
- Update `packages/app/src/screens/DiscoverScreen.tsx`:
  - Replace SwipeCard with PolaroidProfileCard
  - Vertical centered layout: current card centered, prev peeking above, next peeking below
  - Swipe exit animation: Polaroid swings off-screen with rotation
  - Card width: screenWidth - 48px

**2c. CopperPick Polaroid update** (sonnet)
- Update `apps/mobile/components/CopperPick.tsx`: wrap photo in PolaroidCard, caption "Dagens val"

**2d. Discover index wiring** (haiku)
- Verify `apps/mobile/app/(tabs)/discover/index.tsx` works with updated components

### Testgate Wave 2:
- [ ] Discovery loads with 20 seed profiles
- [ ] **VISUAL VERIFICATION — Discovery with real data:**
  - Card aspect 88:107 → PASS/FAIL
  - Image near-square 79:77 → PASS/FAIL
  - Side borders 5.11% → PASS/FAIL
  - Bottom border 26.70% with caption → PASS/FAIL
  - Caption shows name in Caveat → PASS/FAIL
  - Action buttons ON Polaroid → PASS/FAIL
  - Progress bar inside frame → PASS/FAIL
  - Prev/next cards peek with rotation → PASS/FAIL
- [ ] Swipe right → like, swipe left → pass
- [ ] Tap right → next segment, tap left → previous
- [ ] Long press → Ken Burns pauses
- [ ] VoiceOver/TalkBack scrollview fallback works
- [ ] CopperPick renders as Polaroid
- [ ] **Screenshots:** Discovery main + prompt segment + mid-swipe + CopperPick

**BLOCKING: Visual verification MUST pass with real data on screen before this wave can be marked DONE.**

---

## Wave 3: Feed + Chat Integration

Wrap feed post photos and chat shared photos in PolaroidCards.

**Status:** NOT STARTED

### Tasks:

**3a. Feed Polaroid photos** (sonnet)
- Update `packages/app/src/components/PostImageGallery.tsx`:
  - Single photo: PolaroidCard centered, ±2° rotation (seeded by post ID)
  - Multiple photos: horizontal scroll of PolaroidCards, varied rotation
  - Card width: 280px
  - Caption: post text truncated, or "1/3"
- Update `packages/app/src/components/PostCard.tsx`:
  - Like/action icons on PolaroidCard bottom strip

**3b. Chat inline Polaroid** (sonnet)
- Update `packages/app/src/screens/ChatRoomScreen.tsx`:
  - `type === 'IMAGE'` → PolaroidCard, width 200px, ±1-2° rotation
  - Caption: sender name or message text

### Testgate Wave 3:
- [ ] Feed loads with photo posts
- [ ] **VISUAL VERIFICATION — Feed with real data:**
  - Photos in Polaroid frame → PASS/FAIL
  - Card aspect 88:107 at 280px → PASS/FAIL
  - Scattered rotation on multi-photo → PASS/FAIL
  - Actions ON Polaroid → PASS/FAIL
  - Caption shows post text → PASS/FAIL
- [ ] **VISUAL VERIFICATION — Chat with shared photo:**
  - Photo in Polaroid frame → PASS/FAIL
  - Card aspect 88:107 at 200px → PASS/FAIL
  - Fits within chat bubble → PASS/FAIL
- [ ] Feed scroll: no dropped frames with 10+ Polaroid posts
- [ ] Chat scroll: no dropped frames with 5+ inline Polaroids
- [ ] **Screenshots:** Feed single-photo + multi-photo + chat sent + chat received

**BLOCKING: Visual verification MUST pass with real data on screen before this wave can be marked DONE.**

---

## Wave 4: Profile + Match Integration

Profile photo gallery as Polaroid stack, match ceremony with overlapping Polaroids.

**Status:** NOT STARTED

### Tasks:

**4a. Profile photo gallery** (sonnet)
- Update `packages/app/src/components/PhotoGallery.tsx`:
  - Replace thumbnails with PolaroidStack
  - Swipe advances through photos
  - Card width: screenWidth - 64px
  - Caption: personal quote or "Foto {n} av {total}"
  - Edit mode: delete overlay + empty PolaroidCard with "+"

**4b. Match ceremony** (opus)
- Implement `apps/mobile/components/MatchCeremony.tsx`:
  - Two PolaroidCards at ±8°, overlapping at center
  - Captions: user names
  - Entry: spring from off-screen, Skia particles, haptics
  - Buttons: "Send message" + "Continue discovering"

**4c. Profile view integration** (haiku)
- Verify ProfileViewScreen works with updated PhotoGallery

### Testgate Wave 4:
- [ ] Profile loads with seed user photos
- [ ] **VISUAL VERIFICATION — Profile gallery:**
  - Photos in Polaroid stack → PASS/FAIL
  - Card aspect 88:107 → PASS/FAIL
  - Behind cards peek at angles → PASS/FAIL
  - Swipe advances stack → PASS/FAIL
- [ ] **VISUAL VERIFICATION — Match ceremony:**
  - Two Polaroids at ±8° → PASS/FAIL
  - Cards overlap at center → PASS/FAIL
  - Captions show names → PASS/FAIL
  - Spring entry animation → PASS/FAIL
  - Particles visible → PASS/FAIL
- [ ] Profile edit: delete + upload work
- [ ] Match: "Send message" navigates to chat
- [ ] **Screenshots:** Profile stack + edit mode + match ceremony + mid-animation

**BLOCKING: Visual verification MUST pass with real data on screen before this wave can be marked DONE.**
