# Roadmap: F40-UX-polaroid-mobile — Polaroid Design System for Mobile

## Feature Info

- **Feature:** F40-UX-polaroid-mobile
- **Replaces:** F37-polaroid-mobile (complete rewrite)
- **Stitch Projects:** 1086044651106222720, 3228541579636523619
- **Platform:** Expo / React Native / Tamagui
- **Stitch Analysis:** `stitch-analysis.md`
- **Stitch Reference:** `screenshots/stitch-reference/INDEX.md`

---

## Wave 1: Foundation — Polaroid Tokens + Core Components

**Status:** DONE — 2026-03-29

**Visual Verification:**
- Screenshots: screenshots/wave1/run1/
- Comparison: screenshots/wave1/run1/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 1 (run1 = first attempt, passed)

**Stitch source:** html/mobile-match.html, html/mobile-welcome.html, html/mobile-profile-enhanced.html

### Epic 1.1: Extract Polaroid Design Tokens from Stitch HTML

Convert Stitch HTML design tokens to `packages/tokens/polaroid.ts`.

**Task:** Extract all color, typography, shadow, spacing, and proportion tokens from the 11 Stitch HTML files (documented in `stitch-analysis.md`) and create a single token file.

**Acceptance criteria:**
1. `packages/tokens/polaroid.ts` exports all Material 3 copper theme colors from Stitch (primary `#894d0d`, primary-container `#a76526`, surface hierarchy, etc.)
2. Exports Polaroid 600 proportion constants: CARD_ASPECT (88/107), IMAGE_ASPECT (79/77), BORDER_SIDE (0.0511), BORDER_TOP (0.0739), BORDER_BOTTOM (0.2670), IMAGE_WIDTH_RATIO (0.8977)
3. Exports shadow definitions using warm charcoal base colors (rgba(33,26,23,x) and rgba(46,21,0,x)) as documented in stitch-analysis.md
4. Exports typography config: font families (Epilogue/Plus Jakarta Sans/Inter/Be Vietnam Pro/Caveat), sizes, weights
5. Exports gradient definitions: copper-gradient, tonal-gradient
6. Token values match Stitch HTML exactly — no approximations or reinvented values
7. File is importable from both `packages/ui/` and `apps/mobile/`

**File paths:** `packages/tokens/polaroid.ts`, `packages/tokens/index.ts`

### Epic 1.2: Load Caveat Font in Expo

**Task:** Configure Caveat handwritten font for the mobile app via expo-font.

**Acceptance criteria:**
1. Caveat font (400, 700 weights) loads on app startup via expo-font
2. Font is available in Tamagui config as `$handwritten`
3. Works on both iOS and Android
4. Falls back gracefully if font fails to load

**File paths:** `apps/mobile/app/_layout.tsx`, `packages/ui/src/tamagui.config.ts`

### Epic 1.3: Build PolaroidCard Component from Stitch HTML

Convert `mobile-match.html` Polaroid card structure to Tamagui component.

**Task:** Convert the exact Polaroid 600 proportions from mobile-match.html (`.polaroid-container`, `.polaroid-image` CSS classes) to a reusable Tamagui PolaroidCard component. The match screen uses the most precise Polaroid spec: `aspect-ratio: 88/107`, image positioned at `width: 89.77%; height: 72.00%; top: 7.39%; left: 5.11%`.

**Acceptance criteria:**
1. `packages/ui/src/PolaroidCard.tsx` renders a white card with exact 88:107 aspect ratio
2. Image area positioned with 5.11% side, 7.39% top, 26.70% bottom padding (percentage of card width)
3. Image aspect ratio is 79:77 (near-square)
4. Caption area in bottom white strip, centered, Caveat font
5. Shadow uses warm charcoal: `0 8px 24px -2px rgba(46,21,0,0.12)` (from match screen)
6. Props: `imageUrl`, `imageAlt`, `caption?`, `rotation?`, `width`, `onPress?`
7. Card background is pure white (#FFFFFF / surface-container-lowest)
8. Visual output matches the Polaroid cards in mobile-match.html

**File paths:** `packages/ui/src/PolaroidCard.tsx`, `packages/ui/src/index.ts`

### Epic 1.4: Build PolaroidStack Component from Stitch HTML

Convert `mobile-profile-enhanced.html` stack layout to Tamagui component.

**Task:** Convert the 4-layer Polaroid stack from mobile-profile-enhanced.html to a reusable PolaroidStack component. The HTML shows 4 background cards at rotations `+6deg`, `+3deg`, `-2deg`, `-5deg` with translations, plus a front card with swipe dots.

**Acceptance criteria:**
1. `packages/ui/src/PolaroidStack.tsx` renders a stack of PolaroidCards
2. Front card is largest, 2-3 background cards peek at varied rotations (from Stitch: -5 to +6 degrees)
3. Background cards have decreasing opacity (0.6 to 0.9) and scale
4. Container has `perspective: 1200px` for 3D depth
5. Props: `images: Array<{url, caption?}>`, `width`, `activeIndex?`, `onSwipe?`
6. Swipe dot indicator below the stack
7. Visual output matches mobile-profile-enhanced.html stack layout

**File paths:** `packages/ui/src/PolaroidStack.tsx`, `packages/ui/src/index.ts`

### Epic 1.5: Build PolaroidAvatar Component from Stitch HTML

Convert `mobile-chat-inbox.html` avatar structure to Tamagui component.

**Task:** Convert the `.polaroid-avatar-container` from mobile-chat-inbox.html to a mini Polaroid avatar. The HTML shows a 54x66px container with padding `4px 3px 14px 3px`, stack layers at `-3deg` and `+4deg`, and a tiny Caveat name at the bottom.

**Acceptance criteria:**
1. `packages/ui/src/PolaroidAvatar.tsx` renders a mini Polaroid (default 54x66px)
2. Stack layers behind with ghost borders (`0.5px solid #EEDFDA`) at `-3deg` and `+4deg`
3. Tiny Caveat name at bottom of frame (8px font)
4. Props: `imageUrl`, `name?`, `size?`, `rotation?`, `showStack?`
5. Shadow: `0 4px 12px -2px rgba(46,21,0,0.12)`
6. Visual output matches the Polaroid avatars in mobile-chat-inbox.html

**File paths:** `packages/ui/src/PolaroidAvatar.tsx`, `packages/ui/src/index.ts`

---

### Wave 1 Testgate

**Screenshots required:**
- PolaroidCard standalone at 280px width with a seed user photo
- PolaroidStack with 4 seed user photos
- PolaroidAvatar at default size with a seed user photo

**Screenshot location:** `screenshots/wave1/run1/`

**Visual verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V1.1 | Card aspect ratio 88:107 | height/width = 1.216 +/-0.02 | |
| V1.2 | Image aspect ratio 79:77 | width/height = 1.026 +/-0.02 | |
| V1.3 | Side borders 5.11% | border/cardWidth = 0.051 +/-0.01 | |
| V1.4 | Top border 7.39% | border/cardWidth = 0.074 +/-0.01 | |
| V1.5 | Bottom border 26.70% | border/cardWidth = 0.267 +/-0.02 | |
| V1.6 | Bottom ~5x sides | Visual comparison | |
| V1.7 | White background #FFFFFF | Card background is pure white | |
| V1.8 | Warm charcoal shadow | Shadow visible, warm tone (not grey) | |
| V1.9 | Caveat caption | Handwritten cursive text renders | |
| V1.10 | Stack peeking | 2-3 card edges behind main at varied rotations | |
| V1.11 | Avatar mini Polaroid | 54x66 frame with stack layers | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass before proceeding. Seed data MUST be loaded. Spinners/empty screens = automatic FAIL.**

---

## Wave 2: Discovery Screen — Convert Stitch to Tamagui

**Status:** DONE — 2026-03-29

**Visual Verification:**
- Screenshots: screenshots/wave2/run1/
- Comparison: screenshots/wave2/run1/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 1 (run1 = first attempt, passed)

**Stitch source:** html/mobile-discovery.html, html/mobile-discovery-stack.html

### Epic 2.1: Convert mobile-discovery-stack.html to Discovery Screen

Convert `mobile-discovery-stack.html` to the main Discovery screen with Polaroid stack, action buttons, and swipe gestures.

**Task:** Convert the complete discovery-stack.html layout to Tamagui/React Native. Key elements: main Polaroid card with photo + Caveat caption (Emma, 28), 3 background stack cards at varied rotations, action button row (Pass 64px / Star 48px / Like 80px with copper gradient), bottom nav with glassmorphic blur.

**Acceptance criteria:**
1. Discovery screen shows a PolaroidStack with seed user profiles
2. Main card fills `max-w-sm` with asymmetric padding (from Stitch: `12px 12px 48px 12px`)
3. Caption shows `name, age` + one-line tagline in Caveat font
4. 3 background cards visible at rotations from Stitch (-3deg, 1deg, 4deg)
5. Action buttons below: Pass (tertiary X), Star (gold), Like (copper gradient heart) — sizes match Stitch (64/48/80px)
6. Tonal gradient background: `linear-gradient(180deg, rgba(184,115,51,0.08) 0%, rgba(253,248,243,1) 100%)`
7. Visual output matches mobile-discovery-stack.html design

**File paths:** `apps/mobile/app/(tabs)/discover.tsx`, `packages/app/src/screens/DiscoverScreen.tsx`, `packages/app/src/components/DiscoveryActionButtons.tsx`

### Epic 2.2: Convert mobile-discovery.html Vertical Stack Flow

Convert `mobile-discovery.html` vertical stack variant with peeking prev/next cards.

**Task:** Convert the vertical stack flow from mobile-discovery.html. This variant shows the main card centered with a faded previous card peeking above and a next card peeking below. Action buttons are small semi-transparent circles on the photo (top-right corner: close, star, heart at 32px each with `bg-white/60 backdrop-blur-sm`).

**Acceptance criteria:**
1. Previous profile card peeks above main card: `opacity-40 rotate-2 translate-y-4`
2. Next profile card peeks below: `opacity-60 -rotate-3 -translate-y-4`
3. Action buttons overlay on photo: 3 small circles (32px), top-right corner, semi-transparent
4. Swipe up/down navigates between profiles
5. Ken Burns effect on main photo: slow scale on press/focus (`group-hover:scale-105 duration-700`)
6. Visual output matches mobile-discovery.html design

**File paths:** `packages/app/src/components/VerticalDiscoveryStack.tsx`, `packages/app/src/components/OverlayActionButtons.tsx`

### Epic 2.3: Discovery Swipe Gesture Integration

Wire up Reanimated + Gesture Handler for card swiping.

**Task:** Implement swipe right = like, swipe left = pass, tap to view segments. Use existing `useSwipeGesture.ts` hook or create new gesture handling with spring physics. Connect to existing match tRPC router.

**Acceptance criteria:**
1. Swipe right triggers like action via tRPC `match.swipe`
2. Swipe left triggers pass action
3. Card animates off-screen with spring physics (from `constants/animations.ts`)
4. Next card springs into view from behind
5. 60fps on mid-range Android (no dropped frames during swipe)
6. VoiceOver/TalkBack announces profile name and actions
7. Haptic feedback on swipe completion

**File paths:** `packages/app/src/hooks/useDiscoverySwipe.ts`, `apps/mobile/app/(tabs)/discover.tsx`

---

### Wave 2 Testgate

**Screenshots required (4):**
- Discovery main with stack variant (seed profile visible)
- Discovery vertical variant with prev/next peeking
- Mid-swipe animation frame
- Action buttons visible on card

**Screenshot location:** `screenshots/wave2/run1/`

**Stitch reference comparison:**
- `screenshots/stitch-reference/mobile-discovery-stack.png`
- `screenshots/stitch-reference/mobile-discovery.png`

**Visual verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V2.1 | Card aspect ~88:107 | Correct Polaroid proportions | |
| V2.2 | Image near-square | Not tall rectangles (79:77) | |
| V2.3 | Bottom strip with caption | Wide white strip, Caveat name+age | |
| V2.4 | Action buttons sized | Pass 64px, Star 48px, Like 80px | |
| V2.5 | Copper gradient on Like | gradient from #894D0D to #A76526 | |
| V2.6 | Background stack visible | 2-3 cards peeking behind at rotations | |
| V2.7 | Tonal gradient bg | Subtle copper fade at top of screen | |
| V2.8 | Prev/next peek (vertical) | Faded cards above/below main | |
| V2.9 | Real photo loaded | Actual seed profile photo, not placeholder | |
| V2.10 | Matches Stitch | Overall layout matches reference | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass. 20 seed profiles must be loaded. ALL visual items must be PASS.**

---

## Wave 3: Feed + Chat — Convert Stitch to Tamagui

**Stitch source:** html/mobile-feed-revised.html, html/mobile-chat-inbox.html, html/mobile-chat-room.html

### Epic 3.1: Convert mobile-feed-revised.html to Feed Screen

Convert `mobile-feed-revised.html` to the Community Feed with Polaroid photo posts.

**Task:** Convert the revised feed design (warm cream + copper palette). Each post is a white Polaroid card (`bg-white p-2 pb-6`) with varied rotations (-3deg, 2deg, -1deg, 4deg), varied image ratios (3:4, square, 4:5), and action icons (heart + chat) on the bottom white strip next to the caption. Sticky note welcome section at top. FAB for new post.

**Acceptance criteria:**
1. Feed shows photo posts as Polaroid cards with white borders and warm charcoal shadows
2. Cards have scattered rotations from Stitch: `-3deg`, `2deg`, `-1deg`, `4deg`
3. Actions (like/comment) are ON the Polaroid bottom strip, copper-colored icons, not below the card
4. Caption in handwritten font (Caveat/Handlee) on the bottom strip
5. Sticky note section at top: gold background, push-pin effect, handwritten text, slight rotation
6. FAB: copper-to-gold gradient, `rounded-full`, camera icon
7. Paper texture background: `#FDF8F3`
8. Visual output matches mobile-feed-revised.html design

**File paths:** `apps/mobile/app/(tabs)/index.tsx`, `packages/app/src/screens/FeedScreen.tsx`, `packages/app/src/components/PolaroidFeedCard.tsx`

### Epic 3.2: Convert mobile-chat-inbox.html to Chat Inbox

Convert `mobile-chat-inbox.html` to the Messages screen with Polaroid avatars.

**Task:** Convert the chat inbox with Polaroid mini-avatars replacing standard circular avatars. Each conversation row has: PolaroidAvatar (54x66, slight rotation, optional stack layers), name + timestamp, preview text, unread dot (copper with glow). Search bar at top with `rounded-full` input. Section label "Recent Archives" with handwritten "4 new notes".

**Acceptance criteria:**
1. Conversation list uses PolaroidAvatar instead of circular avatars
2. Avatar rotations vary per row: -2deg, 3deg, -1deg, 2deg, -3deg (from Stitch)
3. Unread indicator: copper dot `w-2.5 h-2.5 bg-[#B87333]` with glow shadow `0 0 8px rgba(184,115,51,0.5)`
4. Search bar: `rounded-full` with search icon, warm surface background
5. Active/unread rows use `surface-container-low` background; read rows use `surface-container-lowest`
6. Handwritten section label in Caveat: "4 new notes" in tertiary color
7. Visual output matches mobile-chat-inbox.html design

**File paths:** `apps/mobile/app/(tabs)/chat/index.tsx`, `packages/app/src/screens/ConversationListScreen.tsx`

### Epic 3.3: Convert mobile-chat-room.html to Chat Room

Convert `mobile-chat-room.html` to the chat conversation screen with inline Polaroid photos.

**Task:** Convert the Emma chat room. Key elements: mini Polaroid avatar in header (9px square, rotated 3deg, online dot), received messages in `bg-[#F5F1EE]` rounded bubbles, sent messages in copper gradient, shared photo as inline Polaroid (`polaroid-ratio w-64`, `-rotate-1`, `p-2 pb-8`, with Caveat caption "A coffee morning"), input bar with camera button + rounded input + copper send button.

**Acceptance criteria:**
1. Received message bubbles: `bg-[#F5F1EE] text-[#2C2421]`, `rounded-2xl rounded-bl-none`
2. Sent message bubbles: copper gradient (`#894D0D` to `#A76526`), white text, `rounded-2xl rounded-br-none`
3. Shared photo rendered as inline PolaroidCard: 256px wide, 88:107 ratio, -1deg rotation
4. Photo has 72% height image area with Caveat caption below
5. Timestamps: `text-[10px] text-stone-400`
6. Read receipt: `done_all` icon in primary color
7. Input bar: fixed bottom, glassmorphic `bg-white/60 backdrop-blur-xl`, camera + input + send
8. Header: mini Polaroid avatar (square, rotated), name + "Online" label
9. Warm mesh gradient background
10. Visual output matches mobile-chat-room.html design

**File paths:** `apps/mobile/app/(tabs)/chat/[conversationId].tsx`, `packages/app/src/screens/ChatRoomScreen.tsx`, `packages/app/src/components/ChatPolaroidPhoto.tsx`

---

### Wave 3 Testgate

**Screenshots required (4):**
- Feed with 3+ photo posts (varied rotations visible)
- Chat inbox with Polaroid avatars and unread indicators
- Chat room with sent + received messages
- Chat room with inline Polaroid photo

**Screenshot location:** `screenshots/wave3/run1/`

**Stitch reference comparison:**
- `screenshots/stitch-reference/mobile-feed-revised.png`
- `screenshots/stitch-reference/mobile-chat-inbox.png`
- `screenshots/stitch-reference/mobile-chat-room.png`

**Visual verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V3.1 | Feed photos in Polaroid | White frame around each photo | |
| V3.2 | Scattered rotations | Cards at -3, 2, -1, 4 degrees | |
| V3.3 | Actions ON card | Heart + chat icon on bottom white strip | |
| V3.4 | Feed caption Caveat | Handwritten text, one line | |
| V3.5 | Paper texture bg | Warm cream #FDF8F3, not cold white | |
| V3.6 | Chat Polaroid avatars | Mini Polaroid frames, not circles | |
| V3.7 | Unread copper dot | Copper dot with glow on unread rows | |
| V3.8 | Chat bubble colors | Received: #F5F1EE, Sent: copper gradient | |
| V3.9 | Inline chat Polaroid | 256px wide, 88:107 ratio, -1deg tilt | |
| V3.10 | Copper send button | Gradient circle, send icon | |
| V3.11 | Feed matches Stitch | Layout matches mobile-feed-revised.png | |
| V3.12 | Chat matches Stitch | Layout matches mobile-chat-inbox.png + mobile-chat-room.png | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass. Photo posts and chat image messages must be visible with real seed data. Spinners/empty screens = FAIL.**

---

## Wave 4: Profile + Match + Edit — Convert Stitch to Tamagui

**Stitch source:** html/mobile-profile-enhanced.html, html/mobile-match.html, html/mobile-edit-profile.html

### Epic 4.1: Convert mobile-profile-enhanced.html to Profile View

Convert `mobile-profile-enhanced.html` to the Profile View screen with Polaroid photo gallery.

**Task:** Convert the enhanced profile with 4+1 Polaroid stack (background cards at +6, +3, -2, -5 degrees), front card with square image and Caveat caption, bio section with headline font and border-left accent, interest tags in `rounded-full` pills, message + heart action buttons.

**Acceptance criteria:**
1. Profile photos displayed as PolaroidStack (using Wave 1 component)
2. Stack height ~480px, front card w-80, background cards w-72
3. Background card rotations from Stitch: +6, +3, -2, -5 degrees
4. Front card: square image, `p-[8px] pb-[25px]`, caption in Caveat
5. Swipe dots below stack: active = primary color, inactive = `outline-variant/40`
6. Bio section: Epilogue/PJS heading, left border accent (`border-l-4 border-primary/20`)
7. Interest tags: `rounded-full`, `bg-secondary-container/30`
8. Action buttons: gradient Message button + outlined Heart button
9. Visual output matches mobile-profile-enhanced.html design

**File paths:** `packages/app/src/screens/ProfileViewScreen.tsx`, `apps/mobile/app/(tabs)/profile/index.tsx`

### Epic 4.2: Convert mobile-match.html to Match Ceremony

Convert `mobile-match.html` to the "It's a Connection!" match overlay.

**Task:** Convert the match ceremony screen. Two Polaroids with EXACT 88:107 ratio overlapping at center. Left card: `-rotate-[8deg] -translate-x-8`, right card: `rotate-[8deg] translate-x-8`. Headline "It's a connection!" in tertiary color, Caveat names at bottom of each card, copper glow aura behind (`bg-primary/10 blur-[100px]`), CTA buttons (Send message + Keep discovering).

**Acceptance criteria:**
1. Two PolaroidCards at exact 88:107 aspect ratio
2. Left card: -8 degrees rotation, translated left 32px
3. Right card: +8 degrees rotation, translated right 32px
4. Cards overlap in the center
5. Names in Caveat font (3xl), centered in bottom white strip
6. Headline: "It's a connection!" — tertiary color (`#9f3c1e`), 4xl font
7. Copper glow aura: `bg-primary/10 blur-[100px]` centered behind cards
8. Spring animation: cards enter from off-screen with spring physics
9. Haptic feedback on match
10. CTA buttons: primary gradient "Send a message" + outlined "Keep discovering"
11. Skia particle effects behind cards (from existing SkiaParticles component)
12. Visual output matches mobile-match.html design

**File paths:** `packages/app/src/components/MatchAnimation.tsx`, `packages/app/src/components/MatchCeremony.tsx`

### Epic 4.3: Convert mobile-edit-profile.html to Edit Profile

Convert `mobile-edit-profile.html` to the Edit Profile screen with Polaroid photo grid.

**Task:** Convert the edit profile with 3-column Polaroid photo grid. Existing photos use `.polaroid-ratio` (88:107) with `.polaroid-frame` padding (7.39% 5.11% 26.70% 5.11%), slight rotations (-2, 3, -1 degrees). Empty slots: dashed border `border-2 border-dashed border-outline-variant` with + icon. Form fields: rounded-xl inputs, interest tags with X to remove, toggle switches.

**Acceptance criteria:**
1. Photo grid: 3 columns, each cell has 88:107 aspect ratio
2. Existing photos: Polaroid-framed with shadow and slight rotation from Stitch
3. Empty slots: dashed border, + icon, hover/press state transitions
4. Active tap on photo: straightens rotation (`active:rotate-0`)
5. Form inputs: `bg-surface-container-high border-none rounded-xl`, focus ring = primary
6. Interest tags: `bg-tertiary-fixed`, X button to remove, + "Add more" button
7. Toggle switches: `peer-checked:bg-primary` with white knob
8. Header: "Edit Profile" + "Save" button in copper
9. Visual output matches mobile-edit-profile.html design

**File paths:** `packages/app/src/screens/ProfileEditScreen.tsx`, `packages/app/src/components/PolaroidPhotoGrid.tsx`

---

### Wave 4 Testgate

**Screenshots required (4):**
- Profile view with Polaroid stack (seed user photos)
- Match ceremony with two overlapping Polaroids
- Edit profile with photo grid (3 photos + 3 empty slots)
- Match animation mid-spring frame

**Screenshot location:** `screenshots/wave4/run1/`

**Stitch reference comparison:**
- `screenshots/stitch-reference/mobile-profile-enhanced.png`
- `screenshots/stitch-reference/mobile-match.png`
- `screenshots/stitch-reference/mobile-edit-profile.png`

**Visual verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V4.1 | Profile stack | Front card + 2-3 peeking behind | |
| V4.2 | Profile aspect 88:107 | Correct proportions on all cards | |
| V4.3 | Profile caption Caveat | Handwritten font, one line | |
| V4.4 | Swipe dots | Active = primary, inactive = muted | |
| V4.5 | Match two Polaroids | Two cards overlapping at center | |
| V4.6 | Match +-8 degrees | Cards angled in opposite directions | |
| V4.7 | Match names Caveat | Handwritten names on each card | |
| V4.8 | Copper glow aura | Warm glow behind match cards | |
| V4.9 | Edit photo grid 3 cols | Polaroid-framed photos + dashed empty slots | |
| V4.10 | Edit polaroid-frame | 7.39% / 5.11% / 26.70% / 5.11% padding | |
| V4.11 | Profile matches Stitch | Layout matches reference | |
| V4.12 | Match matches Stitch | Layout matches reference | |
| V4.13 | Edit matches Stitch | Layout matches reference | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass. Seed user photos must be loaded. Match requires two matched profiles in seed data.**

---

## Wave 5: Welcome + Bottom Nav + Polish

**Stitch source:** html/mobile-welcome.html, all screens (bottom nav)

### Epic 5.1: Convert mobile-welcome.html to Welcome/Onboarding Screen

Convert `mobile-welcome.html` to the welcome screen with scattered Polaroids.

**Task:** Convert the welcome screen with 4-5 scattered Polaroid cards at various rotations and positions. Cards use EXACT `aspect-ratio: 88/107` with `padding: 7.39% 5.11% 26.70% 5.11%`. Each has a Caveat caption ("Sunday Coffee", "In the park", "Unfiltered", "Real moments"). Lustre branding at top (uppercase, tracking-widest). Page dots. CTA buttons: copper gradient "Create Account" + text "Sign In".

**Acceptance criteria:**
1. 4-5 scattered Polaroid cards with varied rotations from Stitch (-12, 6, -2, 3, -6 degrees)
2. Cards use exact Polaroid 600 proportions (88:107, correct padding)
3. Each card has a Caveat caption
4. Vintage film aesthetic on images: `grayscale-[10-20%] sepia-[10%]`
5. Lustre logo: uppercase, tracking-widest, copper color
6. Pagination dots: active = copper, inactive = outline-variant
7. CTA buttons: copper gradient primary, text-only secondary
8. Visual output matches mobile-welcome.html design

**File paths:** `apps/mobile/app/(auth)/welcome.tsx`, `packages/app/src/components/ScatteredPolaroids.tsx`

### Epic 5.2: Glassmorphic Bottom Navigation Bar

Convert the bottom nav pattern used consistently across all Stitch screens.

**Task:** Convert the glassmorphic floating bottom nav. All screens use: `bg-[#fff8f6]/80 backdrop-blur-xl rounded-t-[2rem] border-t border-[#d8c3b4]/10 shadow-[0_-8px_30px_rgba(33,26,23,0.05)]`. 4 tabs: Discover, Messages, Feed, Profile. Active: copper color + filled icon + scale-110 + dot indicator. Inactive: `#211a17` at 40% opacity.

**Acceptance criteria:**
1. Bottom nav uses glassmorphic blur: 80% opacity background + backdrop-blur-xl
2. Rounded top corners: `rounded-t-[2rem]` (32px)
3. Ghost border top: `border-[#d8c3b4]/10`
4. Warm shadow: `0 -8px 30px rgba(33,26,23,0.05)`
5. Active tab: copper `#894d0d`, filled icon, scale 1.1, dot indicator above
6. Inactive: `#211a17` at 40% opacity
7. Labels: Plus Jakarta Sans, 10px, uppercase, tracking-widest
8. Safe area padding bottom
9. Consistent across all tabs

**File paths:** `apps/mobile/app/(tabs)/_layout.tsx`, `apps/mobile/components/PolaroidTabBar.tsx`

### Epic 5.3: Glassmorphic Top App Bar

Convert the top bar pattern used across screens.

**Task:** Convert the glassmorphic top app bar. Uses: `bg-[#fff8f6]/60 backdrop-blur-md`, shadow `0 12px 40px rgba(33,26,23,0.05)`, copper-tinted icons and title. Title in Epilogue or Plus Jakarta Sans bold. Fixed positioning, z-50.

**Acceptance criteria:**
1. Top bar uses glassmorphic blur: 60% opacity + backdrop-blur-md
2. Title in Epilogue/PJS font, copper color (`#894d0d`)
3. Navigation icons in copper color with active scale feedback
4. Warm shadow below
5. Adapts per screen (back arrow vs menu, title text, action buttons)
6. Safe area padding top

**File paths:** `apps/mobile/components/PolaroidHeader.tsx`

### Epic 5.4: Visual Polish and Ambient Effects

Add paper texture, ambient gradients, and micro-interactions.

**Task:** Apply the paper texture background (`#FDF8F3` with optional noise), warm mesh gradients for chat, copper glow effects, and micro-interaction polish (button press animations, card hover-straighten, Ken Burns on photos).

**Acceptance criteria:**
1. Default background color is `#FDF8F3` (warm white) across all screens
2. Feed has paper texture background (fractal noise or SVG noise pattern)
3. Chat room has warm mesh gradient background
4. Discovery has tonal gradient (copper fade from top)
5. Button press animations: scale 0.95 with spring
6. Card press/focus: straighten rotation + slight lift
7. Photo Ken Burns: slow 5% zoom on long press or focus

**File paths:** `apps/mobile/components/PaperTextureBackground.tsx`, various screen files

---

### Wave 5 Testgate

**Screenshots required (4):**
- Welcome screen with scattered Polaroids
- Bottom navigation bar (glassmorphic, active tab visible)
- Top app bar on discovery screen
- Feed with paper texture background

**Screenshot location:** `screenshots/wave5/run1/`

**Stitch reference comparison:**
- `screenshots/stitch-reference/mobile-welcome.png`
- All other screens for nav bar consistency

**Visual verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V5.1 | Welcome scattered cards | 4-5 Polaroids at varied rotations | |
| V5.2 | Welcome exact 88:107 | Each card correct aspect ratio | |
| V5.3 | Welcome Lustre branding | Uppercase, tracking-widest, copper | |
| V5.4 | Bottom nav glassmorphic | Semi-transparent with blur | |
| V5.5 | Bottom nav ghost border | border-[#d8c3b4]/10 visible | |
| V5.6 | Active tab copper | Copper icon + label + dot | |
| V5.7 | Top bar glassmorphic | Semi-transparent header with blur | |
| V5.8 | Warm white bg | #FDF8F3, not cold white or grey | |
| V5.9 | Paper texture | Subtle noise/texture on feed bg | |
| V5.10 | Welcome matches Stitch | Layout matches reference | |
| V5.11 | Nav matches Stitch | Consistent across all screens | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass. All screens must render with seed data. Welcome screen must show Polaroid photos (not empty frames).**

---

## Dependency Graph

```
Wave 1 (Foundation)
  |
  +-- Wave 2 (Discovery) -- uses PolaroidCard, PolaroidStack
  |
  +-- Wave 3 (Feed + Chat) -- uses PolaroidCard, PolaroidAvatar
  |
  +-- Wave 4 (Profile + Match + Edit) -- uses PolaroidCard, PolaroidStack
  |
  +-- Wave 5 (Welcome + Nav + Polish) -- uses PolaroidCard, all components

Waves 2-4 can technically run in parallel after Wave 1.
Wave 5 depends on all prior waves for consistency check.
```

## Summary

| Wave | Epics | Stitch HTML Sources | Key Deliverable |
|---|---|---|---|
| 1 | 5 | match, welcome, profile-enhanced, chat-inbox | Tokens + PolaroidCard + PolaroidStack + PolaroidAvatar |
| 2 | 3 | discovery, discovery-stack | Discovery screen with swipe gestures |
| 3 | 3 | feed-revised, chat-inbox, chat-room | Feed + Chat with Polaroid integration |
| 4 | 3 | profile-enhanced, match, edit-profile | Profile view + Match ceremony + Edit profile |
| 5 | 4 | welcome, all (nav bars) | Welcome + glassmorphic nav + polish |
| **Total** | **18 epics** | **11 Stitch HTML files** | **Complete Polaroid mobile app** |
