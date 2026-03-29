# F41-UX-polaroid-web — Roadmap

**Feature:** Polaroid Design System for Web (Next.js) — Complete Rebuild
**Stitch Project v1:** 1086044651106222720
**Stitch Project v2:** 3228541579636523619
**Depends on:** F40 Wave 1 (`packages/tokens/polaroid.ts`) — already exists
**Status:** DONE — all waves implemented, tested, and visually verified — 2026-03-29

---

## Wave 1: Foundation — Design Tokens + PolaroidCard Component

**Status:** DONE — 2026-03-29

**Visual Verification:**
- Screenshots: screenshots/wave1/run1/
- Comparison: screenshots/wave1/run1/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 1 (run1 = first attempt, run1 = final pass)

**Goal:** CSS custom properties for all Polaroid tokens + the core `PolaroidCard` component with exact Polaroid 600 proportions.

**Stitch source:** `html/desktop-feed-revised.html`, `html/desktop-match.html`, `html/desktop-edit-profile.html`

### Epic 1.1: Polaroid CSS Tokens

**Description:** Convert design tokens from Stitch HTML Tailwind config to CSS custom properties in `apps/web/styles/tokens.css` (Section 11).

**Task:** Extract the Material 3 color palette from Stitch HTML configs and add them as CSS variables. Add Polaroid-specific tokens (aspect ratios, padding ratios, shadows, rotation presets).

**Stitch source tokens (from `desktop-feed-revised.html` Tailwind config):**
- `--stitch-primary: #894d0d`
- `--stitch-primary-container: #a76526`
- `--stitch-surface: #fff8f6`
- `--stitch-surface-container-lowest: #ffffff`
- `--stitch-surface-container-low: #fff1ec`
- `--stitch-surface-container: #faebe6`
- `--stitch-surface-container-high: #f4e5e0`
- `--stitch-surface-container-highest: #eedfda`
- `--stitch-on-surface: #211a17`
- `--stitch-on-surface-variant: #524439`
- `--stitch-outline: #857467`
- `--stitch-outline-variant: #d8c3b4`
- `--stitch-secondary: #795900`
- `--stitch-secondary-container: #fece65`
- `--stitch-tertiary: #9f3c1e`
- `--stitch-tertiary-container: #bf5334`
- Polaroid tokens: `--polaroid-card-aspect: 88 / 107`, `--polaroid-image-aspect: 79 / 77`, `--polaroid-border-side: 5.11%`, `--polaroid-border-top: 7.39%`, `--polaroid-border-bottom: 26.70%`, `--polaroid-bg: #ffffff`
- Shadow: `--polaroid-shadow: 0 10px 30px -10px rgba(33, 26, 23, 0.15)`
- Shadow hover: `--polaroid-shadow-hover: 0 12px 40px -10px rgba(33, 26, 23, 0.2)`
- Background gradient: `--stitch-gradient: linear-gradient(135deg, #fff8f6 0%, #faebe6 50%, #f4e5e0 100%)`

**Acceptance criteria:**
1. Section 11 of `tokens.css` contains all Stitch color tokens
2. Section 11 contains all Polaroid proportion tokens
3. Values match Stitch HTML exactly (no approximations)
4. Existing F33 tokens in sections 1-10 are not modified
5. Build passes: `pnpm build`

**File paths:** `apps/web/styles/tokens.css`

---

### Epic 1.2: Caveat Font Setup

**Description:** Load Caveat font via `next/font/google` and expose it as `--font-caveat` CSS variable.

**Task:** Convert font setup from Stitch HTML `<link>` tag to Next.js `next/font/google` in `apps/web/app/layout.tsx`. Register Caveat with weights 400 and 700. Also load Epilogue (headlines), Be Vietnam Pro (labels) if not already loaded.

**Stitch source fonts:** `Caveat:wght@400..700` (from `desktop-feed-revised.html`)

**Acceptance criteria:**
1. Caveat font loads via `next/font/google` (no external CDN)
2. CSS variable `--font-caveat` is available
3. Epilogue and Be Vietnam Pro are available as CSS variables
4. No layout shift on font load (swap display)
5. Build passes

**File paths:** `apps/web/app/layout.tsx`, `apps/web/styles/fonts.ts`

---

### Epic 1.3: PolaroidCard Component

**Description:** Convert Polaroid card structure from Stitch HTML to a CSS Module + React Server Component.

**Task:** Convert the Polaroid card from `desktop-edit-profile.html` (which uses exact 600 proportions via `.polaroid-ratio` and `.polaroid-content` classes) into `PolaroidCard.tsx` + `PolaroidCard.module.css`.

**Stitch source CSS (from `desktop-edit-profile.html`):**
```css
.polaroid-ratio { aspect-ratio: 88 / 107; }
.polaroid-content { padding: 7.39% 5.11% 26.70% 5.11%; }
```

**Props:** `imageUrl`, `imageAlt`, `caption?`, `rotation?`, `stack?`, `hoverable?`, `className?`, `children?`, `onClick?`

**Acceptance criteria:**
1. Card uses `aspect-ratio: 88 / 107`
2. Padding matches: 7.39% top, 5.11% sides, 26.70% bottom
3. Image uses `aspect-ratio: 79 / 77` with `object-fit: cover`
4. Caption renders in Caveat font
5. Stack variant shows 2 pseudo-element layers behind card
6. Hover: rotate to 0deg, translateY(-8px), scale(1.02), shadow increase
7. `prefers-reduced-motion`: instant transitions (0ms duration)
8. Background is `#ffffff` (surface-container-lowest)
9. Shadow matches `0 10px 30px -10px rgba(33, 26, 23, 0.15)`
10. Renders as RSC (no 'use client')

**File paths:** `apps/web/components/common/PolaroidCard.tsx`, `apps/web/components/common/PolaroidCard.module.css`

---

### Epic 1.4: PolaroidMasonryGrid Component

**Description:** Convert masonry grid from Stitch HTML to a CSS Module + React Server Component.

**Task:** Convert the CSS columns masonry from `desktop-feed-revised.html` and `desktop-discovery-revised.html` into a reusable grid component.

**Stitch source CSS:**
```css
.masonry-grid { column-count: 3; column-gap: 2rem; }
.masonry-item { break-inside: avoid; margin-bottom: 2.5rem; }
/* discovery variant: */
@media (min-width: 1536px) { .polaroid-grid { column-count: 4; } }
```

**Props:** `children`, `columns?` (default responsive), `gap?`, `className?`

**Acceptance criteria:**
1. Uses CSS `column-count` (not CSS Grid)
2. Responsive: 4 columns at 1440px+, 3 at 900px+, 2 at 600px+, 1 below 600px
3. Items have `break-inside: avoid`
4. Column gap: 2rem
5. Item margin-bottom: 2.5rem
6. Nth-child rotation: 8 variations from -5deg to +4deg
7. Renders as RSC

**File paths:** `apps/web/components/common/PolaroidMasonryGrid.tsx`, `apps/web/components/common/PolaroidMasonryGrid.module.css`

---

### Testgate 1

**Screenshots required:** PolaroidCard at 280px width (normal + hover + stack variant), PolaroidMasonryGrid with 6 placeholder items at 1440px/900px/599px.

**Verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V1.1 | Card aspect 88:107 | height/width = 1.216 +/-0.02 | |
| V1.2 | Image aspect 79:77 | near-square | |
| V1.3 | Side border 5.11% | 14.3px at 280px width | |
| V1.4 | Top border 7.39% | 25.2px at 340.5px height | |
| V1.5 | Bottom border 26.70% | 90.9px at 340.5px height | |
| V1.6 | Background #ffffff | Pure white | |
| V1.7 | Caption font Caveat | Handwritten style | |
| V1.8 | Shadow present | Matches Stitch | |
| V1.9 | Hover: straighten + lift | rotate(0) + translateY(-8px) | |
| V1.10 | Stack variant | 2 pseudo-elements visible | |
| V1.11 | Masonry 4-col at 1440px | 4 staggered columns | |
| V1.12 | Masonry 1-col at 599px | Single column | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass before proceeding to Wave 2. PolaroidCard must render with a real image (not placeholder). Seed data must be loaded.**

---

## Wave 2: Discovery — Polaroid Profile Grid

**Status:** DONE — 2026-03-29

**Visual Verification:**
- Screenshots: screenshots/wave2/run1/
- Comparison: screenshots/wave2/run1/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 1 (run1 = first attempt, run1 = final pass)

**Goal:** Convert the Discovery browse page to a Polaroid masonry grid of profile cards.

**Stitch source:** `html/desktop-discovery-revised.html`, `html/desktop-discovery.html`

### Epic 2.1: Discovery Grid Page

**Description:** Convert `desktop-discovery-revised.html` to the `/discover/browse` page using PolaroidMasonryGrid + PolaroidCard.

**Task:** Refactor `/discover/browse/page.tsx` to render profiles as PolaroidCard inside PolaroidMasonryGrid. Each card shows: profile photo (aspect 4/5), name + age + tagline as Caveat caption, "New" badge for recent profiles. First 3 profiles use stack variant.

**Stitch source layout:**
- Left nav: 288px
- Main: `ml-72 p-12`, max-w-7xl
- Page title: "Daily Discoveries" in `text-5xl font-extrabold font-headline tracking-tighter`
- Grid: 3-4 column CSS columns
- Card padding: `p-[8px] pb-[22px]`
- Image: `aspect-[4/5]`
- Caption: `font-handwritten text-xl truncate`
- Rotation: varied per card (-5 to +5 deg)
- Stack cards: 2 pseudo-element layers

**Acceptance criteria:**
1. Discovery page uses PolaroidMasonryGrid
2. Each profile renders as PolaroidCard
3. Image aspect ratio 4/5 (as in Stitch, not strict 79/77 for discovery)
4. First 3 cards show stack variant
5. Varied rotation per card (nth-child pattern)
6. "New" badge on recent profiles
7. Hover: straighten + lift + scale
8. Page title matches Stitch typography
9. Keyboard navigation preserved (arrow keys + L/P)
10. 20 seed profiles visible

**File paths:** `apps/web/app/(app)/discover/browse/page.tsx`, `apps/web/components/discover/DiscoverGrid.tsx`, `apps/web/components/discover/DiscoverGrid.module.css`

---

### Epic 2.2: Discovery Filter Bar

**Description:** Convert the filter bar from `desktop-discovery-revised.html` to the discovery page header.

**Task:** Extract the search input + filter chips (Age, Distance, Interests) + action buttons (tune, notifications, avatar) from Stitch HTML and implement as a sticky header bar.

**Stitch source layout:**
- Sticky header: `bg-orange-50 backdrop-blur-xl h-20`
- Search: `rounded-full bg-surface-container-highest w-80`
- Filter chips: `rounded-full px-4 py-1.5`, active chip has bg, inactive text only
- Right: tune icon, notification icon with dot, avatar (40px round)

**Acceptance criteria:**
1. Sticky header matches Stitch layout
2. Search input renders
3. Filter chips render with active/inactive states
4. Notification badge (red dot) renders
5. User avatar renders (40px round)

**File paths:** `apps/web/components/discover/FilterBar.tsx`, `apps/web/components/discover/FilterBar.module.css`

---

### Epic 2.3: Discovery FAB

**Description:** Convert the floating action button from `desktop-discovery-revised.html`.

**Task:** Add a FAB at bottom-right with the `auto_awesome` icon, copper-to-ember gradient.

**Stitch source:**
```html
<button class="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-primary to-tertiary text-on-primary rounded-full shadow-2xl">
```

**Acceptance criteria:**
1. FAB positioned fixed bottom-right
2. Gradient matches: primary to tertiary
3. Hover: scale 1.1
4. Icon rotates 12deg on hover

**File paths:** `apps/web/components/discover/DiscoverFAB.tsx`, `apps/web/components/discover/DiscoverFAB.module.css`

---

### Testgate 2

**Screenshots required (4):** Discovery at 1440px (4 columns), 900px (3 columns), 599px (1 column), hover state on card.

**Stitch reference:** `desktop-discovery-revised.png`

**Verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V2.1 | White Polaroid frames | Every profile card has white border | |
| V2.2 | Varied rotation | Cards tilted at different angles | |
| V2.3 | Image aspect 4:5 | Not tall rectangles | |
| V2.4 | Caveat captions | Handwritten name+age | |
| V2.5 | Stack on first 3 | Peeking edges behind cards | |
| V2.6 | 4-column at 1440px | 4 staggered columns | |
| V2.7 | 3-column at 900px | 3 staggered columns | |
| V2.8 | 1-column at 599px | Single Polaroid per row | |
| V2.9 | Hover state | Card straightens + lifts | |
| V2.10 | Filter bar visible | Search + chips + avatar | |
| V2.11 | 20 seed profiles | Real photos loaded | |
| V2.12 | Matches Stitch | Layout matches desktop-discovery-revised.png | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass. 20 seed profiles must be loaded. Empty/loading screens = FAIL. Screenshots at all 3 breakpoints required.**

---

## Wave 3: Feed + Chat — Polaroid Posts and Messages

**Status:** DONE — 2026-03-29

**Visual Verification:**
- Screenshots: screenshots/wave3/run1/
- Comparison: screenshots/wave3/run1/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 1 (run1 = first attempt, run1 = final pass)

**Goal:** Convert Feed and Chat pages to use Polaroid cards for photo content.

**Stitch source:** `html/desktop-feed-revised.html`, `html/desktop-chat-inbox.html`

### Epic 3.1: Feed Page with Polaroid Posts

**Description:** Convert `desktop-feed-revised.html` to the `/home` feed page.

**Task:** Refactor `PostCard.tsx` to render photo posts as PolaroidCard inside PolaroidMasonryGrid. Each card shows: photo with varied aspect ratio (square, 4/5, 3/4, 4/3), handwritten caption, heart + comment icons with counts, timestamp. Text-only posts remain unchanged.

**Stitch source layout:**
- Three-zone: left nav 256px, main (`ml-64 mr-80`), right sidebar 320px
- Sticky header: "Flode" title, notifications, "Share a moment" CTA
- Masonry: 3 columns, 2rem gap
- Polaroid frame: `padding: 10px 10px 25px 10px`
- Caption: `font-handwritten text-xl`
- Actions: Heart (tertiary color, FILL 1 if liked) + Comment (secondary) + count + timestamp
- Right sidebar: "Trending Moments" with mini Polaroid thumbnails, "Suggested" profiles

**Acceptance criteria:**
1. Photo posts render as PolaroidCard in masonry grid
2. Caption in Caveat font below image
3. Heart + comment icons ON the Polaroid (in bottom area)
4. Timestamp visible: `text-[9px] uppercase tracking-widest`
5. Text-only posts unchanged (no Polaroid frame)
6. Right sidebar: trending + suggested sections
7. Varied rotations per card
8. Grayscale-[10%] with hover to full color (optional polish)
9. 3-column masonry layout
10. Real feed posts with photos visible

**File paths:** `apps/web/app/(app)/home/page.tsx`, `apps/web/components/feed/FeedList.tsx`, `apps/web/components/feed/PostCard.tsx`, `apps/web/components/feed/PostCard.module.css`, `apps/web/components/feed/FeedSidebar.tsx`, `apps/web/components/feed/FeedSidebar.module.css`

---

### Epic 3.2: Chat Layout with Polaroid Avatars

**Description:** Convert `desktop-chat-inbox.html` to the chat pages.

**Task:** Refactor chat layout to 3-panel design: conversation list (30%) with Polaroid avatar thumbnails, active chat panel (45%) with gradient sent bubbles, mini profile panel (25%) with large Polaroid photo.

**Stitch source layout:**
- Full height: `flex h-screen overflow-hidden`
- Conversation list: `w-[30%] bg-surface-container-low`
- Active conversation: Mini Polaroid (`polaroid-aspect p-1 pb-4 -rotate-3`, image `h-[72%]`)
- Active chat: `w-[45%] bg-white shadow-xl`
- Sent bubble: `bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl rounded-br-none`
- Received bubble: `bg-surface-container-low rounded-2xl rounded-bl-none`
- Mini profile: `w-[25%] bg-[#FDF8F3]`, large Polaroid photo with `polaroid-aspect`
- Chat input: rounded-2xl with add + send buttons

**Acceptance criteria:**
1. 3-panel layout matches Stitch proportions (30/45/25)
2. Conversation list has Polaroid avatar thumbnails with rotation
3. Active conversation highlighted with shadow
4. Sent messages: copper gradient bubble
5. Received messages: surface-container-low bg
6. Mini profile panel: large Polaroid with caption
7. Mini profile hidden below xl breakpoint
8. Chat input with send button
9. Typing indicator dots
10. Real conversation data visible

**File paths:** `apps/web/components/chat/ChatLayout.tsx`, `apps/web/components/chat/ChatLayout.module.css`, `apps/web/components/chat/ConversationList.tsx`, `apps/web/components/chat/ConversationList.module.css`, `apps/web/components/chat/MessageBubble.tsx`, `apps/web/components/chat/MessageBubble.module.css`, `apps/web/components/chat/MiniProfile.tsx`, `apps/web/components/chat/MiniProfile.module.css`

---

### Testgate 3

**Screenshots required (4):** Feed at 1440px with photo posts, Feed right sidebar, Chat 3-panel at 1440px, Chat at 900px (mini profile hidden).

**Stitch references:** `desktop-feed-revised.png`, `desktop-chat-inbox.png`

**Verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V3.1 | Feed photos in Polaroid | White frame around photos | |
| V3.2 | Feed varied aspect | Square + 4/5 + 3/4 images | |
| V3.3 | Caption in Caveat | Handwritten font below image | |
| V3.4 | Actions ON card | Heart + comment in bottom area | |
| V3.5 | Text-only unchanged | No Polaroid on text posts | |
| V3.6 | 3-column masonry | Staggered layout | |
| V3.7 | Chat 3-panel | 30/45/25 proportions | |
| V3.8 | Polaroid avatars | Rotated mini Polaroids in conv list | |
| V3.9 | Gradient sent bubbles | Copper gradient | |
| V3.10 | Feed matches Stitch | Layout matches desktop-feed-revised.png | |
| V3.11 | Chat matches Stitch | Layout matches desktop-chat-inbox.png | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass. Photo posts and chat messages must show real content. Empty screens = FAIL.**

---

## Wave 4: Profile + Match + Edit — Gallery, Modal, Form

**Status:** DONE — 2026-03-29

**Visual Verification:**
- Screenshots: screenshots/wave4/run1/
- Comparison: screenshots/wave4/run1/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 1 (run1 = first attempt, run1 = final pass)

**Goal:** Convert Profile view (scattered gallery), Match modal (overlapping Polaroids), and Edit Profile (gallery + form).

**Stitch source:** `html/desktop-profile-refined.html`, `html/desktop-match.html`, `html/desktop-edit-profile.html`

### Epic 4.1: Profile View — Scattered Polaroid Gallery

**Description:** Convert `desktop-profile-refined.html` to the `/profile/[userId]` page.

**Task:** Implement the split layout: 60% scattered Polaroid gallery (absolutely positioned, varied sizes/rotations, perspective), 40% info panel (name, bio, interests, about me, action buttons). Add sticky notes component.

**Stitch source layout:**
- Split: `flex h-[calc(100vh-4rem)]`
- Gallery: `w-3/5 relative flex items-center justify-center p-12`, `perspective: 1000px`
- Central Polaroid: `w-[340px] z-40 shadow-2xl rotate(-1deg)`
- Surrounding: `w-56` to `w-64`, rotations -5 to +6 deg, various translate offsets
- Polaroid padding: `9px 9px 24px 9px`
- Image: `aspect-square`
- Hover: `scale(1.05) rotate(0deg)`, shadow increase, spring easing
- Info panel: `w-2/5 p-12 pr-20 overflow-y-auto`, max-w-md
- Name: `text-4xl font-extrabold font-headline tracking-tight`
- Bio: `bg-surface-container p-6 rounded-xl border-l-4 border-primary/20 italic`
- Interests: Colored pill tags (primary-fixed, secondary-fixed, surface-container-highest, tertiary-fixed)
- Sticky notes: `bg-secondary-container` with push_pin icon + `bg-[#fef9c3]` yellow variant

**Acceptance criteria:**
1. 60/40 split layout matches Stitch
2. 5 Polaroid photos scattered with varied rotations and positions
3. Central hero photo largest with highest z-index
4. Perspective on gallery container
5. Hover: scale + straighten + shadow
6. Spring easing: `0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)`
7. Info panel: name, verified badge, location, bio, interests, about me
8. Sticky note component with push_pin
9. "Send Message" gradient CTA button
10. Seed profile photos visible

**File paths:** `apps/web/components/profile/ProfileView.tsx`, `apps/web/components/profile/ProfileView.module.css`, `apps/web/components/profile/ScatteredGallery.tsx`, `apps/web/components/profile/ScatteredGallery.module.css`, `apps/web/components/profile/StickyNote.tsx`, `apps/web/components/profile/StickyNote.module.css`

---

### Epic 4.2: Match Modal — Overlapping Polaroids

**Description:** Convert `desktop-match.html` to the match notification modal.

**Task:** Implement the match modal with: blurred background overlay, two overlapping PolaroidCards at +/-10 degrees with exact 600 proportions, title "It's a connection!", action buttons.

**Stitch source layout:**
- Overlay: `bg-on-surface/40 backdrop-blur-sm`
- Modal: `max-w-2xl bg-[#FDF8F3] p-12 rounded-xl shadow-2xl`
- Title: `text-5xl font-extrabold text-[#894d0d]`
- Left Polaroid: `w-56 -rotate-[10deg] -translate-x-16`, exact 600 proportions
- Right Polaroid: `w-56 rotate-[10deg] translate-x-16`
- Caption: `font-handwritten text-3xl` in bottom 26.70%
- Primary CTA: `bg-[#B87333] py-4 rounded-md font-bold`
- Secondary CTA: `border-2 border-[#B87333]/30 py-4 rounded-md`
- Decorative dots: 3 colored dots at bottom

**Acceptance criteria:**
1. Overlay with blur
2. Two Polaroids with exact 88:107 aspect ratio
3. Image area: 89.77% width, 72% height, margins: 7.39% top, 5.11% sides
4. Left card: -10deg rotation
5. Right card: +10deg rotation
6. Cards overlap at center (negative translate)
7. Captions in Caveat font, 3xl size
8. Primary + secondary action buttons
9. Close button top-right
10. Spring entrance animation (motion/react)

**File paths:** `apps/web/components/common/MatchModal.tsx`, `apps/web/components/common/MatchModal.module.css`

---

### Epic 4.3: Edit Profile — Polaroid Gallery + Form

**Description:** Convert `desktop-edit-profile.html` to the profile edit page.

**Task:** Implement the two-column edit layout: left 40% photo management (Polaroid grid with exact 600 proportions, empty dashed slots), right 60% profile form (inputs, toggles, interest tags).

**Stitch source layout:**
- Two-column: `flex-row gap-16`
- Left 40%: `grid-cols-2 gap-6`
- Featured photo: `col-span-2`, full Polaroid with `.polaroid-ratio` + `.polaroid-content`
- Empty slots: `border-2 border-dashed border-outline-variant`, "Add Photo" + camera icon
- Photo counter: `font-caption text-2xl text-primary -rotate-3`
- Right 60%: Form sections with copper-accent headers
- Inputs: `bg-surface-container-high border-none rounded-xl`
- Interest tags: `bg-tertiary-fixed rounded-full` with close button
- Toggle switches: Custom CSS checkbox with primary color
- CTA: Copper gradient "Save Changes" button

**Acceptance criteria:**
1. Two-column layout matches Stitch (40/60)
2. Featured photo uses exact 600 proportions
3. Empty slots: dashed border Polaroid frame with "Add Photo"
4. Photo hover overlay with edit + delete buttons
5. Form inputs match Stitch styling
6. Interest tags as removable pills
7. Privacy toggles functional
8. Save button with copper gradient
9. Photo counter in Caveat font
10. Responsive: stacks vertically below 900px

**File paths:** `apps/web/components/profile/ProfileEdit.tsx`, `apps/web/components/profile/ProfileEdit.module.css`, `apps/web/components/profile/PhotoGrid.tsx`, `apps/web/components/profile/PhotoGrid.module.css`

---

### Testgate 4

**Screenshots required (6):** Profile view at 1440px, Profile view at 900px, Match modal open, Edit profile at 1440px, Edit profile at 900px (stacked), Profile hover state on gallery card.

**Stitch references:** `desktop-profile-refined.png`, `desktop-match.png`, `desktop-edit-profile.png`

**Verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V4.1 | Scattered gallery | 5 photos at varied rotations | |
| V4.2 | Central hero largest | w-340px, z-40 | |
| V4.3 | Perspective visible | 3D depth on gallery | |
| V4.4 | Gallery hover | Scale + straighten + shadow | |
| V4.5 | Sticky notes | Push-pinned notes visible | |
| V4.6 | Info panel | Name + bio + interests + CTA | |
| V4.7 | Match two Polaroids | 88:107 ratio, overlapping | |
| V4.8 | Match +/-10 degrees | Cards angled opposite | |
| V4.9 | Match captions | Caveat font names | |
| V4.10 | Edit photo grid | Featured + 5 empty slots | |
| V4.11 | Edit form | Inputs + toggles + tags | |
| V4.12 | Profile matches Stitch | Layout matches desktop-profile-refined.png | |
| V4.13 | Match matches Stitch | Layout matches desktop-match.png | |
| V4.14 | Edit matches Stitch | Layout matches desktop-edit-profile.png | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass. Seed profile photos loaded. Match modal with two matched profiles. Empty screens = FAIL.**

---

## Wave 5: Left Nav + Polish + Responsive

**Status:** DONE — 2026-03-29

**Visual Verification:**
- Screenshots: screenshots/wave5/run1/
- Comparison: screenshots/wave5/run1/COMPARISON.md
- Gate result: PASS (verify-wave-screenshots.sh exit 0)
- Runs needed: 1 (run1 = first attempt, run1 = final pass)

**Goal:** Convert the left sidebar navigation from Stitch, apply final polish, ensure responsive behavior at all breakpoints.

**Stitch source:** `html/desktop-feed-revised.html` (nav), `html/desktop-profile-refined.html` (nav variant), all screens (responsive)

### Epic 5.1: Left Sidebar Navigation

**Description:** Convert the left nav sidebar from Stitch HTML to a shared layout component.

**Task:** Implement the Stitch sidebar: Lustre logo (italic headline, copper), tagline, navigation items (Discover, Messages, Feed, Profile), active state with border-right + bg, hover effects, bottom section (Privacy, Help), "New Entry" CTA.

**Stitch source layout (from `desktop-feed-revised.html`):**
- Width: `w-64` (256px), fixed left
- Logo: `text-3xl font-black text-[#894d0d] font-headline`
- Tagline: `text-xs font-bold uppercase tracking-widest text-outline`
- Nav items: `py-3 px-4 rounded-lg`, icon + label
- Active: `text-[#894d0d] font-bold bg-[#faebe6]`, icon FILL 1
- Inactive: `text-[#725c53]`
- Hover: `bg-[#faebe6] translate-x-1`
- Bottom: `border-t border-outline-variant/20`

**Acceptance criteria:**
1. Fixed left sidebar, 256px wide
2. Logo + tagline match Stitch
3. Nav items with Material Symbols icons
4. Active state: copper text + bg + FILL 1 icon
5. Hover: bg highlight + slight translateX
6. Bottom links section
7. Responsive: collapses to icon-only at <900px, hidden at <599px

**File paths:** `apps/web/components/layout/NavRail.tsx`, `apps/web/components/layout/NavRail.module.css`

---

### Epic 5.2: Right Sidebar (Feed)

**Description:** Convert the right sidebar from `desktop-feed-revised.html` as a context panel.

**Task:** Implement "Trending Moments" (mini Polaroid thumbnails with rotation + hover) and "Suggested" profiles section.

**Stitch source:**
- Width: `w-80` (320px), fixed right
- Trending: Mini Polaroid `w-16 h-16 p-1 pb-3 rotate-2 polaroid-shadow`
- Suggested: `bg-surface-container-lowest rounded-2xl p-6 shadow-sm`
- Profile item: Avatar circle + name + label + add button

**Acceptance criteria:**
1. Right sidebar 320px, fixed
2. Mini Polaroid trending items with rotation + hover
3. Suggested profiles with add button
4. Hidden at <1200px (responsive)

**File paths:** `apps/web/components/layout/ContextPanel.tsx`, `apps/web/components/layout/ContextPanel.module.css`

---

### Epic 5.3: Responsive Polish

**Description:** Ensure all pages work at 1440px, 900px, and 599px breakpoints.

**Task:** Add responsive CSS for all components. Left nav collapses at <900px. Right sidebar hidden at <1200px. Masonry reduces columns. Profile gallery stacks vertically at <900px. Chat hides mini profile at <1200px.

**Acceptance criteria:**
1. All pages render correctly at 1440px
2. All pages render correctly at 900px (tablet)
3. All pages render correctly at 599px (mobile)
4. No horizontal overflow at any breakpoint
5. Touch targets >= 44px on mobile
6. Bottom nav appears at <599px (existing from F33)

**File paths:** Various `.module.css` files

---

### Testgate 5

**Screenshots required (6):** Feed at 1440px (full layout with sidebars), Feed at 900px (collapsed nav), Feed at 599px (mobile), Discovery at 599px, Chat at 900px, Profile at 599px.

**Stitch references:** All Stitch reference images (final comparison)

**Verification checklist:**

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V5.1 | Left nav matches Stitch | Logo + items + active state | |
| V5.2 | Right sidebar matches | Trending + suggested | |
| V5.3 | Nav collapses at <900px | Icon-only or hidden | |
| V5.4 | Sidebar hidden at <1200px | More space for content | |
| V5.5 | 599px mobile layout | Single column, bottom nav | |
| V5.6 | No overflow | No horizontal scroll at any width | |
| V5.7 | Feed 1440 matches Stitch | Full desktop layout | |
| V5.8 | Discovery 599 | Single column grid | |

**Gate script:** `~/bin/verify-wave-screenshots.sh`

**BLOCKING: Visual verification MUST pass at all 3 breakpoints. All pages must show real data.**

---

## Dependency Graph

```
Wave 1 (Foundation: Tokens + Card + Grid)
  |
  +---> Wave 2 (Discovery: Profile Grid)
  |       |
  +---> Wave 3 (Feed + Chat)
  |       |
  +-------+---> Wave 4 (Profile + Match + Edit)
                  |
                  +---> Wave 5 (Nav + Polish + Responsive)
```

Waves 2 and 3 can run in parallel after Wave 1. Wave 4 depends on both. Wave 5 is final polish.

---

## Summary

| Wave | Screens | Epics | Stitch HTML Sources |
|---|---|---|---|
| 1 | Foundation | 4 | desktop-feed-revised, desktop-match, desktop-edit-profile |
| 2 | Discovery | 3 | desktop-discovery-revised, desktop-discovery |
| 3 | Feed + Chat | 2 | desktop-feed-revised, desktop-chat-inbox |
| 4 | Profile + Match + Edit | 3 | desktop-profile-refined, desktop-match, desktop-edit-profile |
| 5 | Nav + Polish | 3 | desktop-feed-revised, desktop-profile-refined, all |
| **Total** | **10 screens** | **15 epics** | **10 HTML files** |
