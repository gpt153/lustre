# Roadmap: F37 — Polaroid Design System for Mobile

**Status:** IN_PROGRESS — code complete, visual verification NOT done
**Created:** 2026-03-29
**Waves:** 4

---

## Wave 1: Foundation (tokens + font + base PolaroidCard)

Create Polaroid token constants, install Caveat font, build base PolaroidCard and PolaroidStack. Components exist in isolation, not yet integrated into screens.

**Status:** NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken

**Stitch source:** `mobile-discovery-stack.html` (Polaroid card proportions, border ratios, shadow, rotation angles, Caveat caption styling)

### Epics: ALL VERIFIED (code exists and compiles)
- 1a Polaroid tokens — VERIFIED
- 1b Caveat font — VERIFIED
- 1c PolaroidCard — VERIFIED
- 1d PolaroidStack — VERIFIED
- 1e Exports — VERIFIED

### Testgate Wave 1:
- [x] `packages/tokens/polaroid.ts` builds — tsc --noEmit clean
- [x] `POLAROID.CARD_ASPECT` = 0.8224
- [x] `POLAROID.BORDER_BOTTOM` = 0.2670
- [x] `getPolaroidDimensions(300)` returns correct values
- [x] Caveat fonts added to expo-loader
- [x] PolaroidCard component exists with correct props
- [x] PolaroidStack component exists with 3-layer rendering
- [x] `pnpm install` succeeds
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
- [ ] **Gate script:** `~/bin/verify-wave-screenshots.sh <feature-dir> 1` exits 0

**BLOCKING: Visual verification MUST pass with real data on screen before this wave can be marked DONE.**

### Tasks:

**1a. Polaroid tokens** (haiku)
- Convert `mobile-discovery-stack.html` design tokens to `packages/tokens/polaroid.ts`:
  - Extract card proportions, border ratios, shadow values, and rotation angles from Stitch HTML
  - `POLAROID` object: `CARD_ASPECT` (88/107), `IMAGE_ASPECT` (79/77), `BORDER_SIDE` (0.0511), `BORDER_TOP` (0.0739), `BORDER_BOTTOM` (0.2670), `IMAGE_WIDTH_RATIO` (0.8977)
  - `getPolaroidDimensions(cardWidth: number)` utility
  - `POLAROID_ROTATIONS` preset array: `[-5, -3, -1.5, 0, 1.5, 3, 5]`
  - `POLAROID_SHADOW` matching spec
- Update `packages/tokens/index.ts` to re-export
- **Acceptance:** Token values match `mobile-discovery-stack.html` design proportions
- **Visual output matches `mobile-discovery-stack.html` design**

**1b. Caveat font** (haiku)
- Install `@expo-google-fonts/caveat` in `packages/ui/`
- Update `packages/ui/src/fonts/expo-loader.ts` to load `Caveat_400Regular` and `Caveat_700Bold`
- Reference: Caveat font usage visible in `mobile-discovery-stack.html` caption areas

**1c. PolaroidCard component** (sonnet)
- Convert `mobile-discovery-stack.html` Polaroid card structure to Tamagui/React Native in `packages/ui/src/PolaroidCard.tsx`:
  - Match the card frame, image area, caption area, and shadow from Stitch HTML
  - Props: `cardWidth`, `imageSource`, `caption?`, `rotation?`, `shadow?`, `onPress?`, `children?`, `style?`, `accessibilityLabel?`
  - Dimensions via `getPolaroidDimensions(cardWidth)`
  - Spring press animation via `useAnimatedStyle` + `withSpring` (SPRING.snappy)
  - Caption in Caveat_400Regular, `numberOfLines={1}`, centered
  - Children overlay positioned absolutely over image area
- **Visual output matches `mobile-discovery-stack.html` design**

**1d. PolaroidStack component** (sonnet)
- Convert `mobile-discovery-stack.html` stacked card layout to Tamagui/React Native in `packages/ui/src/PolaroidStack.tsx`:
  - Match the 3-layer card arrangement, rotation offsets, and scale from Stitch HTML
  - Props: `images`, `cardWidth`, `captions?`, `onCardPress?`
  - Up to 3 cards: front at 0°, behind at ±2-4° with 0.95/0.90 scale
  - Tap advances with spring animation
- **Visual output matches `mobile-discovery-stack.html` design**

**1e. Exports** (haiku)
- Update `packages/ui/src/index.ts` to export PolaroidCard and PolaroidStack

---

## Wave 2: Discovery Integration

Replace SwipeCard/ProfileCardStory with Polaroid-based discovery cards. Highest-risk wave — must preserve gesture composition, Ken Burns, story segments, accessibility.

**Status:** NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken

**Stitch source:** `mobile-discovery.html` (vertical discovery layout, progress bar, caption area, action buttons), `mobile-discovery-stack.html` (card stack with peek cards, swipe animation targets)

### Epics: ALL VERIFIED (code exists and compiles)
- 2a PolaroidProfileCard — VERIFIED
- 2b Discovery refactor — VERIFIED
- 2c CopperPick — VERIFIED
- 2d Discover index wiring — VERIFIED

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
- [ ] **Gate script:** `~/bin/verify-wave-screenshots.sh <feature-dir> 2` exits 0

**BLOCKING: Visual verification MUST pass with real data on screen before this wave can be marked DONE.**

### Tasks:

**2a. PolaroidProfileCard** (opus)
- Convert `mobile-discovery.html` profile card layout to Tamagui/React Native in `apps/mobile/components/PolaroidProfileCard.tsx`:
  - Match the story progress bar placement, name/age caption, action button layout, and Ken Burns image area from Stitch HTML
  - Wraps PolaroidCard with ProfileCardStoryProfile data
  - StoryProgressBar inside Polaroid frame (image area, top)
  - Name/age in caption area (Caveat)
  - Action buttons on white bottom strip, right-aligned
  - Ken Burns within image area bounds
  - Gesture.Race composition preserved
  - Long-press pause preserved
- **Visual output matches `mobile-discovery.html` design**

**2b. Discovery stack refactor** (opus)
- Convert `mobile-discovery-stack.html` stack layout to Tamagui/React Native in `packages/app/src/screens/DiscoverScreen.tsx`:
  - Match the vertical centered layout, peek card offsets, and swipe exit animation from Stitch HTML
  - Replace SwipeCard with PolaroidProfileCard
  - Vertical centered layout: current card centered, prev peeking above, next peeking below
  - Swipe exit animation: Polaroid swings off-screen with rotation
  - Card width: screenWidth - 48px
- **Visual output matches `mobile-discovery-stack.html` design**

**2c. CopperPick Polaroid update** (sonnet)
- Convert `mobile-discovery-stack.html` CopperPick section to Tamagui/React Native in `apps/mobile/components/CopperPick.tsx`:
  - Wrap photo in PolaroidCard, caption "Dagens val"
- **Visual output matches `mobile-discovery-stack.html` design**

**2d. Discover index wiring** (haiku)
- Verify `apps/mobile/app/(tabs)/discover/index.tsx` works with updated components

---

## Wave 3: Feed + Chat Integration

Wrap feed post photos and chat shared photos in PolaroidCards.

**Status:** NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken

**Stitch source:** `mobile-feed.html` (community feed with Polaroid photo posts), `mobile-feed-revised.html` (revised feed with warm cream/copper theme, updated Polaroid layout), `mobile-chat-inbox.html` (chat inbox list), `mobile-chat-room.html` (chat room with inline Polaroid images)

### Epics: ALL VERIFIED (code exists and compiles)
- 3a Feed Polaroid — VERIFIED
- 3b Chat Polaroid — VERIFIED

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
- [ ] **Gate script:** `~/bin/verify-wave-screenshots.sh <feature-dir> 3` exits 0

**BLOCKING: Visual verification MUST pass with real data on screen before this wave can be marked DONE.**

### Tasks:

**3a. Feed Polaroid photos** (sonnet)
- Convert `mobile-feed.html` and `mobile-feed-revised.html` feed photo layout to Tamagui/React Native:
  - Update `packages/app/src/components/PostImageGallery.tsx`:
    - Match the Polaroid-framed photo posts, rotation scatter, and action button placement from Stitch HTML
    - Single photo: PolaroidCard centered, ±2° rotation (seeded by post ID)
    - Multiple photos: horizontal scroll of PolaroidCards, varied rotation
    - Card width: 280px
    - Caption: post text truncated, or "1/3"
  - Update `packages/app/src/components/PostCard.tsx`:
    - Like/action icons on PolaroidCard bottom strip
- **Visual output matches `mobile-feed.html` and `mobile-feed-revised.html` design**

**3b. Chat inline Polaroid** (sonnet)
- Convert `mobile-chat-room.html` chat image layout to Tamagui/React Native:
  - Update `packages/app/src/screens/ChatRoomScreen.tsx`:
    - Match the inline Polaroid image rendering within chat bubbles from Stitch HTML
    - `type === 'IMAGE'` → PolaroidCard, width 200px, ±1-2° rotation
    - Caption: sender name or message text
- **Visual output matches `mobile-chat-room.html` design**

---

## Wave 4: Profile + Match Integration

Profile photo gallery as Polaroid stack, match ceremony with overlapping Polaroids.

**Status:** NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken

**Stitch source:** `mobile-profile.html` (profile with Polaroid stack gallery), `mobile-profile-enhanced.html` (enhanced profile with improved Polaroid stack), `mobile-match.html` (match ceremony with overlapping Polaroid cards), `mobile-edit-profile.html` (profile edit mode with Polaroid photo slots)

### Epics: ALL VERIFIED (code exists and compiles)
- 4a Profile PhotoGallery — VERIFIED
- 4b MatchCeremony — VERIFIED
- 4c Profile view integration — VERIFIED

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
- [ ] **Gate script:** `~/bin/verify-wave-screenshots.sh <feature-dir> 4` exits 0

**BLOCKING: Visual verification MUST pass with real data on screen before this wave can be marked DONE.**

### Tasks:

**4a. Profile photo gallery** (sonnet)
- Convert `mobile-profile.html` and `mobile-profile-enhanced.html` photo gallery to Tamagui/React Native:
  - Update `packages/app/src/components/PhotoGallery.tsx`:
    - Match the Polaroid stack layout, card peek angles, and swipe-to-advance from Stitch HTML
    - Replace thumbnails with PolaroidStack
    - Swipe advances through photos
    - Card width: screenWidth - 64px
    - Caption: personal quote or "Foto {n} av {total}"
  - Convert `mobile-edit-profile.html` edit mode to Tamagui/React Native:
    - Edit mode: delete overlay + empty PolaroidCard with "+"
    - Match the edit-mode Polaroid slot layout from Stitch HTML
- **Visual output matches `mobile-profile-enhanced.html` design (gallery) and `mobile-edit-profile.html` design (edit mode)**

**4b. Match ceremony** (opus)
- Convert `mobile-match.html` match screen to Tamagui/React Native in `apps/mobile/components/MatchCeremony.tsx`:
  - Match the two overlapping Polaroid cards at ±8°, name captions, particle effects, and button layout from Stitch HTML
  - Two PolaroidCards at ±8°, overlapping at center
  - Captions: user names
  - Entry: spring from off-screen, Skia particles, haptics
  - Buttons: "Send message" + "Continue discovering"
- **Visual output matches `mobile-match.html` design**

**4c. Profile view integration** (haiku)
- Verify ProfileViewScreen works with updated PhotoGallery
