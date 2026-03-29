# F41-UX-polaroid-web — Stitch HTML Analysis

**Analyzed:** 2026-03-29
**Stitch Project v1:** 1086044651106222720 (7 screens)
**Stitch Project v2:** 3228541579636523619 (3 screens)
**Total HTML files:** 10

---

## 1. Design Tokens (Extracted from HTML)

### 1.1 Color Palette (Material 3 System)

All 10 HTML files share the same color token set:

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#894d0d` | Dark copper — primary brand, CTAs, active nav |
| `primary-container` | `#a76526` | Gradient end, secondary copper |
| `surface` | `#fff8f6` | Page background |
| `background` | `#fff8f6` | Body background |
| `surface-container-lowest` | `#ffffff` | Polaroid card background |
| `surface-container-low` | `#fff1ec` | Sidebar backgrounds, feed area |
| `surface-container` | `#faebe6` | Active nav item bg, bio card bg |
| `surface-container-high` | `#f4e5e0` | Input fields bg, gradient end |
| `surface-container-highest` | `#eedfda` | Search input bg, tag bg |
| `surface-dim` | `#e6d7d2` | Subtle bg layer |
| `on-surface` | `#211a17` | Primary text, charcoal |
| `on-surface-variant` | `#524439` | Caption text, secondary text |
| `on-background` | `#211a17` | Body text |
| `outline` | `#857467` | Muted labels, timestamps |
| `outline-variant` | `#d8c3b4` | Ghost borders (at 10-30% opacity) |
| `secondary` | `#795900` | Gold accent |
| `secondary-container` | `#fece65` | Sticky note bg, gold highlights |
| `secondary-fixed` | `#ffdf9f` | Interest tag bg (gold) |
| `tertiary` | `#9f3c1e` | Ember/red accent |
| `tertiary-container` | `#bf5334` | Ember container |
| `tertiary-fixed` | `#ffdbd1` | Interest tag bg (warm) |
| `error` | `#ba1a1a` | Error states |
| `inverse-surface` | `#372f2b` | Dark mode surface |
| `primary-fixed` | `#ffdcc2` | Light copper fill |
| `primary-fixed-dim` | `#ffb77b` | Copper accent |

### 1.2 Background Gradient

Used consistently across feed and discovery screens:
```css
background: linear-gradient(135deg, #fff8f6 0%, #faebe6 50%, #f4e5e0 100%);
/* Alternate (discovery): */
background: linear-gradient(135deg, #fff8f6 0%, #faebe6 50%, #fff1ec 100%);
```

### 1.3 Typography

| Role | Font | Used In |
|---|---|---|
| `headline` | Epilogue | Headlines, nav items, section titles (screens 1-7) |
| `headline` | Plus Jakarta Sans | Headlines (screens 8-10: match, chat, edit-profile) |
| `body` | Plus Jakarta Sans | Body text (screens 1-7) |
| `body` | Inter | Body text (screens 8-10) |
| `label` | Be Vietnam Pro | Labels, timestamps (screens 1-7) |
| `label` | Inter | Labels (screens 8-10) |
| `handwritten` | Caveat | Polaroid captions (primary, most screens) |
| `handwritten` | Patrick Hand | Polaroid captions (discovery screens) |
| `handwritten` | Reenie Beanie | Polaroid captions (match screen) |

**Decision for F41:** Standardize on Caveat (primary), Patrick Hand (fallback) for handwritten. Epilogue for headlines. Plus Jakarta Sans for body. Be Vietnam Pro for labels.

### 1.4 Typography Sizes

| Context | Classes | Approx Size |
|---|---|---|
| Page title | `text-5xl font-extrabold tracking-tighter` | 48px |
| Section heading | `text-3xl font-extrabold tracking-tighter` | 30px |
| Card heading | `text-2xl font-handwritten` | 24px |
| Nav item | `text-base font-medium` | 16px |
| Body text | `text-sm` | 14px |
| Timestamp | `text-xs uppercase tracking-widest` | 12px |
| Micro label | `text-[10px] uppercase tracking-widest` | 10px |
| Micro label (tracking) | `text-[9px] uppercase tracking-widest` | 9px |

### 1.5 Border Radius

```js
borderRadius: { DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", full: "0.75rem" }
```

Additionally used:
- `rounded-sm` on Polaroid cards (2px)
- `rounded-lg` on nav items, buttons (8px)
- `rounded-xl` on inputs, modals, action buttons (12px)
- `rounded-2xl` on suggestion cards, chat bubbles (16px)
- `rounded-full` on pills, avatars, filter chips

---

## 2. Component Structure

### 2.1 Polaroid Card (Feed Post)

Two variants found across screens:

**Variant A — "Revised" (desktop-feed-revised.html):**
```css
.polaroid-frame { padding: 10px 10px 25px 10px; }
.polaroid-shadow { box-shadow: 0 10px 30px -10px rgba(33, 26, 23, 0.15); }
```
- Image: `aspect-square` or `aspect-[4/5]` or `aspect-[3/4]` or `aspect-[4/3]`
- Caption: `font-handwritten text-xl`
- Actions: Heart + Comment icons with count, timestamp
- Border: `border border-outline-variant/10`
- Background: `bg-surface-container-lowest` (#ffffff)

**Variant B — "Masonry" (desktop-feed-masonry.html):**
```css
padding: 2px; padding-bottom: 8px-12px; /* varies */
.polaroid-shadow { box-shadow: 0 10px 30px -10px rgba(33, 26, 23, 0.1); }
```
- More compact padding
- Larger caption: `font-handwritten text-2xl`
- Full icon row: Heart + Comment icons without counts

**Variant C — "Exact Polaroid 600" (desktop-match.html, desktop-chat-inbox.html):**
```css
.polaroid-ratio { aspect-ratio: 88 / 107; }
.polaroid-img-box { width: 89.77%; height: 72%; margin-top: 7.39%; margin-left: 5.11%; margin-right: 5.11%; }
```
- Exact 600 proportions
- Caption in bottom 26.70% area

**Variant D — "Edit Profile" (desktop-edit-profile.html):**
```css
.polaroid-ratio { aspect-ratio: 88 / 107; }
.polaroid-content { padding: 7.39% 5.11% 26.70% 5.11%; }
```
- Uses CSS percentage padding matching the 600 spec exactly

### 2.2 Polaroid Card (Discovery Profile)

From desktop-discovery-revised.html:
```css
.polaroid-card {
  break-inside: avoid;
  margin-bottom: 2.5rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.polaroid-card:hover {
  transform: rotate(0deg) translateY(-8px) scale(1.02) !important;
  z-index: 50;
}
```
- Padding: `p-[8px] pb-[22px]` (compact Polaroid frame)
- Image: `aspect-[4/5]`
- Caption: `font-handwritten text-xl truncate`
- Rotation: Style attribute, varied per card (-5 to +5 deg)
- "New" badge: Absolute positioned, top-right

### 2.3 Stack Effect

Used on discovery and profile screens:
```html
<div class="absolute inset-0 bg-surface-container-lowest border border-outline-variant/10 shadow-sm translate-x-2 translate-y-2 -rotate-2"></div>
<div class="absolute inset-0 bg-surface-container-lowest border border-outline-variant/10 shadow-sm translate-x-1 translate-y-1 rotate-1"></div>
<div class="relative ..."><!-- actual card --></div>
```
- 2 pseudo-layers behind main card
- Slightly offset + rotated

### 2.4 Profile Scattered Gallery

From desktop-profile-gallery.html and desktop-profile-refined.html:
- 5 Polaroid photos, absolutely positioned
- Central hero: `w-80` / `w-[340px]`, `z-40`
- Surrounding: `w-56` to `w-64`, varied rotations (-5 to +6 deg)
- All `aspect-square` image areas
- Hover: `scale(1.05) rotate(0deg)`, shadow increase
- `perspective: 1000px` on container

### 2.5 Sticky Notes

From profile screens:
```html
<div class="bg-secondary-container p-5 shadow-lg max-w-[200px] rounded-sm">
  <span class="material-symbols-outlined absolute -top-4 left-1/2 -translate-x-1/2">push_pin</span>
  <p class="font-handwritten text-xl">...</p>
</div>
```
Also yellow variant: `bg-[#fef9c3]`

### 2.6 Chat Layout (3-Panel)

From desktop-chat-inbox.html:
- `flex h-screen overflow-hidden`
- Left sidebar: `w-64` (nav)
- Conversation list: `w-[30%]`
- Active chat: `w-[45%]`
- Mini profile: `w-[25%]` (hidden below xl)
- Conversation avatar: Mini Polaroid with `polaroid-aspect` (88/107), `p-1 pb-4`, rotation
- Chat bubbles: Received = `bg-surface-container-low rounded-2xl rounded-bl-none`
- Sent: `bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl rounded-br-none`

### 2.7 Match Modal

From desktop-match.html:
- Full-screen overlay: `bg-on-surface/40 backdrop-blur-sm`
- Modal: `max-w-2xl bg-[#FDF8F3] p-12 rounded-xl shadow-2xl`
- Title: `font-headline text-5xl font-extrabold text-[#894d0d]`
- Two Polaroids: `polaroid-ratio w-56` with exact 600 proportions
- Left card: `-rotate-[10deg] -translate-x-16`
- Right card: `rotate-[10deg] translate-x-16`
- Caption in bottom 26.70%: `font-handwritten text-3xl`
- CTA: `bg-[#B87333]` primary button + outline secondary

### 2.8 Edit Profile

From desktop-edit-profile.html:
- 2-column: `lg:flex-row gap-16`
- Left 40%: Photo gallery grid (`grid-cols-2 gap-6`)
- Right 60%: Form sections
- Featured photo: `col-span-2`, full Polaroid with exact 600 proportions
- Empty slots: `border-2 border-dashed border-outline-variant`, camera icon + "Add Photo"
- Form inputs: `bg-surface-container-high border-none rounded-xl`
- Toggle switches: Custom CSS checkbox

---

## 3. Layout Patterns

### 3.1 Three-Zone Desktop Layout

Most screens use:
```
[Left Nav: 256-288px] [Main Content: flex] [Right Sidebar: 320px]
```
- Left nav: `w-64` (256px) or `w-72` (288px), fixed
- Main: `ml-64 mr-80` (or `ml-72`)
- Right sidebar: `w-80` (320px), fixed right

### 3.2 Masonry Grid (Feed)

```css
.masonry-grid {
  column-count: 3;
  column-gap: 2rem;
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 2rem-2.5rem;
}
```

### 3.3 Masonry Grid (Discovery)

```css
.polaroid-grid {
  column-count: 3;
  column-gap: 2rem;
}
@media (min-width: 1536px) {
  .polaroid-grid { column-count: 4; }
}
```

### 3.4 Profile Split Layout

```
[Scattered Polaroid Gallery: 60%] [Info Panel: 40%]
```
- Gallery: `relative flex items-center justify-center`, `perspective: 1000px`
- Info: `overflow-y-auto`, max-w-md

### 3.5 Chat 3-Panel

```
[Nav: 256px] [Conversations: 30%] [Chat: 45%] [Mini Profile: 25%]
```

---

## 4. Shadow System

| Name | CSS | Usage |
|---|---|---|
| Polaroid shadow (light) | `0 10px 30px -10px rgba(33, 26, 23, 0.1)` | Feed cards |
| Polaroid shadow (medium) | `0 10px 30px -10px rgba(33, 26, 23, 0.15)` | Revised feed cards |
| Polaroid shadow (chat) | `0 8px 24px -2px rgba(46, 21, 0, 0.08)` | Chat cards |
| Polaroid shadow (match) | `0 10px 30px -5px rgba(33, 26, 23, 0.1), 0 4px 12px -2px rgba(33, 26, 23, 0.05)` | Match modal |
| Profile hover | `0 12px 40px -10px rgba(33, 26, 23, 0.15)` | Profile gallery hover |
| Card default | `0 4px 20px -5px rgba(33, 26, 23, 0.1)` | Profile polaroids |

---

## 5. Interaction Patterns

### 5.1 Hover Effects

- **Polaroid card (feed/discovery):** Rotate to 0deg + translateY(-8px) + scale(1.02)
- **Polaroid card (profile):** Scale(1.05) + rotate(0deg) + shadow increase
- **Sticky note:** Scale(1.02) + rotate(0deg)
- **Nav item:** translateX(+4px) + bg change
- **Sidebar Polaroid thumbnail:** rotate to 0deg
- **Grayscale reveal:** `grayscale-[10-20%]` default, `grayscale-0` on hover

### 5.2 Transitions

- Card transform: `0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)` (back-out spring)
- Color transitions: `0.3s ease`
- Nav hover: `0.2s ease`
- Grayscale: `0.7s` duration

### 5.3 Rotation Patterns

| Screen | Rotations Used |
|---|---|
| Feed revised | -4, +5, -2, +3, -5, +4 deg |
| Feed masonry | -2, +3, -1, +1, -3, +4 deg |
| Discovery | -3.5, +4.2, -1.2, +5, -4.8, +2.8, -2.5 deg |
| Profile gallery | -3, +4(+6), -1, +5(+4), -4(-5) deg |
| Match | -10, +10 deg |
| Chat avatars | -3, +2, -2, +3 deg |
| Edit profile | +1, -2, +1, 0, -1 deg |

---

## 6. Icon System

All screens use Material Symbols Outlined:
```css
font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
```
- Active/filled state: `font-variation-settings: 'FILL' 1;`
- Icons: explore, chat_bubble, auto_stories, account_circle/person_pin, favorite, notifications, mail, send, trending_up, group_add, person_add, search, tune, add, close, push_pin, photo_camera, wine_bar, terrain, forum, expand_more, location_on, verified, edit, delete, videocam, info, add_circle, settings, shield, help_outline, auto_awesome, photo_library, auto_awesome_motion, person, person_pin_circle, auto_awesome_mosaic

---

## 7. Responsive Notes

- Desktop-only screens (no mobile breakpoints in Stitch HTML)
- Nav sidebar assumed collapsible at smaller widths
- Discovery grid: 4 columns at 1536px+, 3 columns default
- Chat mini-profile: `hidden xl:block`
- F41 must add breakpoints: 1440px (desktop), 900px (tablet), 599px (mobile)

---

## 8. Screen-to-Component Mapping

| Screen | Target Component/Page | Primary Stitch Source |
|---|---|---|
| desktop-feed-revised | `/home/page.tsx` (Feed) | desktop-feed-revised.html |
| desktop-feed-masonry | `/home/page.tsx` (Feed alternate) | desktop-feed-masonry.html |
| desktop-feed | `/home/page.tsx` (Feed compact) | desktop-feed.html |
| desktop-discovery | `/discover/browse/page.tsx` | desktop-discovery.html |
| desktop-discovery-revised | `/discover/browse/page.tsx` | desktop-discovery-revised.html |
| desktop-profile-gallery | `/profile/[userId]/page.tsx` | desktop-profile-gallery.html |
| desktop-profile-refined | `/profile/[userId]/page.tsx` | desktop-profile-refined.html |
| desktop-match | `MatchModal` component | desktop-match.html |
| desktop-chat-inbox | `/chat/page.tsx` + `/chat/[id]/page.tsx` | desktop-chat-inbox.html |
| desktop-edit-profile | `/profile/edit/page.tsx` | desktop-edit-profile.html |

**Preferred variants (for implementation):**
- Feed: desktop-feed-revised.html (most polished, with actions)
- Discovery: desktop-discovery-revised.html (correct proportions)
- Profile: desktop-profile-refined.html (sticky notes + refined spacing)
- Match/Chat/Edit: Only one variant each
