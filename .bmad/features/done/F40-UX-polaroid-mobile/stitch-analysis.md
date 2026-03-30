# Stitch Analysis — F40-UX-polaroid-mobile

Analyzed: 2026-03-29
Sources: 11 Stitch HTML screens from projects 1086044651106222720 and 3228541579636523619

---

## 1. Design Tokens

### 1.1 Color Palette (Material 3 Copper Theme)

The Stitch screens use two color systems. Screens from project v1 (feed, profile, discovery) use the full Material 3 token set. The revised feed screen (mobile-feed-revised.html) uses a simplified palette. The v2 screens (match, chat, welcome, edit-profile, chat-room) use the full Material 3 set consistently.

#### Primary Colors (Consistent Across All Screens)

| Token | Hex | Usage |
|---|---|---|
| primary | `#894d0d` | Dark copper, headers, active nav, CTAs |
| primary-container | `#a76526` | Button gradients, badges |
| primary-fixed | `#ffdcc2` | Selection highlights |
| primary-fixed-dim | `#ffb77b` | Inverse primary, accents |
| on-primary | `#ffffff` | Text on primary |
| on-primary-container | `#fffbff` | Text on primary-container |

#### Secondary Colors

| Token | Hex | Usage |
|---|---|---|
| secondary | `#795900` | Gold tone |
| secondary-container | `#fece65` | Sticky notes, badges, gold accent areas |
| secondary-fixed | `#ffdf9f` | Lighter gold |
| secondary-fixed-dim | `#eec058` | Muted gold |

#### Tertiary Colors

| Token | Hex | Usage |
|---|---|---|
| tertiary | `#9f3c1e` | Ember/red-brown, "Connection!" headline |
| tertiary-container | `#bf5334` | Alert areas |
| tertiary-fixed | `#ffdbd1` | Interest tags (edit profile) |

#### Surface Hierarchy (8 Levels)

| Token | Hex | Usage |
|---|---|---|
| surface-container-lowest | `#ffffff` | Polaroid card backgrounds, pure white |
| surface-container-low | `#fff1ec` | Chat input bg, empty slots |
| surface | `#fff8f6` | Page background, warm white |
| surface-container | `#faebe6` | Bio container, search input |
| surface-container-high | `#f4e5e0` | Form inputs, placeholder images |
| surface-container-highest | `#eedfda` | Toggle tracks, elevated surfaces |
| surface-bright | `#fff8f6` | Same as surface |
| surface-dim | `#e6d7d2` | Dim overlays |
| surface-variant | `#eedfda` | Same as highest |

#### Text Colors

| Token | Hex | Usage |
|---|---|---|
| on-surface | `#211a17` | Primary text |
| on-surface-variant | `#524439` | Secondary text, captions |
| outline | `#857467` | Muted text, timestamps |
| outline-variant | `#d8c3b4` | Ghost borders, dividers |

#### Simplified Palette (mobile-feed-revised.html)

| Token | Hex | Usage |
|---|---|---|
| copper | `#B87333` | Primary/CTA |
| gold | `#D4A843` | Accent |
| warm-cream | `#FDF8F3` | Background |
| charcoal | `#2C2421` | Text |

### 1.2 Typography

#### Font Families (Two Systems)

**Project v1 Screens:**
| Role | Font | Tailwind Key |
|---|---|---|
| Headlines | Epilogue (700, 800, 900) | `headline` |
| Body | Plus Jakarta Sans (400-700) | `body` |
| Labels | Be Vietnam Pro (400, 500) | `label` |
| Captions | Caveat (400, 700) or Handlee | `handwritten` / `script` |

**Project v2 Screens (match, chat-inbox, welcome, edit-profile, chat-room):**
| Role | Font | Tailwind Key |
|---|---|---|
| Headlines | Plus Jakarta Sans (400-800) | `headline` |
| Body | Inter (400-600) | `body` |
| Labels | Inter (400-500) | `label` |
| Captions | Caveat | `handwriting` |

#### Font Sizes Used

| Size | Context |
|---|---|
| text-4xl / text-5xl (36-48px) | Match headline "It's a connection!" |
| text-3xl (30px) | Welcome logo, match Polaroid names |
| text-2xl (24px) | App bar title, section headlines, handwritten captions |
| text-xl (20px) | Caption text, section titles |
| text-lg (18px) | App bar name, input labels |
| text-sm (14px) | Body text, message text |
| text-xs (12px) | Timestamps, counters |
| text-[10px] | Nav labels, time stamps, micro labels |
| text-[8px] | Tiny Polaroid avatar names |

### 1.3 Shadows

| Name/Usage | Value |
|---|---|
| Polaroid shadow (v1 - feed) | `0 10px 25px -5px rgba(33,26,23,0.1), 0 8px 10px -6px rgba(33,26,23,0.1)` |
| Polaroid shadow (v1 - profile) | `0 4px 15px rgba(33,26,23,0.08)` |
| Polaroid shadow (discovery-stack) | `0 10px 30px -10px rgba(33,26,23,0.15)` |
| Polaroid shadow (profile-enhanced) | `0 4px 20px rgba(33,26,23,0.12)` |
| Polaroid shadow (v2 - match left) | `0 8px 24px -2px rgba(46,21,0,0.12)` |
| Polaroid shadow (v2 - match right) | `0 12px 32px -4px rgba(46,21,0,0.15)` |
| App bar shadow | `0 12px 40px rgba(33,26,23,0.05)` |
| Bottom nav shadow | `0 -8px 30px rgba(33,26,23,0.05)` |
| Chat room shadow | `0 8px 24px -2px rgba(46,21,0,0.08)` |

**Key observation:** All shadows use warm charcoal base (`rgba(33,26,23,x)` or `rgba(46,21,0,x)`), never cold grey. Opacity ranges from 0.03 to 0.15. This is critical for the Lustre feel.

### 1.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| DEFAULT | 0.125rem (2px) | Minimal, image corners |
| lg | 0.25rem (4px) | Card corners |
| xl | 0.5rem (8px) | Input fields |
| full | 0.75rem (12px) | Max radius for cards |
| rounded-xl | 0.75rem | Buttons, inputs |
| rounded-full | 9999px | Pills, avatars, nav items |
| rounded-t-[2rem] | 2rem (32px) | Bottom nav top corners |
| rounded-2xl | 1rem | Chat bubbles |

### 1.5 Gradients

| Name | Value | Usage |
|---|---|---|
| Copper gradient | `linear-gradient(135deg, #894D0D 0%, #A76526 100%)` | CTA buttons, sent message bubbles |
| Tonal gradient | `linear-gradient(180deg, rgba(184,115,51,0.08) 0%, rgba(253,248,243,1) 100%)` | Discovery background |
| Glow aura | `bg-primary/10 blur-[100px]` | Match screen decorative glow |
| Warm mesh | Radial gradients with warm tones | Chat room background |
| Header fade | `from-[#FDF8F3] to-transparent` | Welcome header |

### 1.6 Spacing Patterns

| Pattern | Values |
|---|---|
| Page horizontal padding | px-6 (24px), px-4 (16px) |
| Section vertical spacing | space-y-8 (32px), space-y-12 (48px) |
| Card internal padding | p-2 to p-3 (8-12px) |
| Bottom bar padding | pb-8 (32px safe area) |
| Top bar height | h-16 (64px) |
| Card gaps | gap-4 to gap-8 (16-32px) |

---

## 2. Component Structure

### 2.1 PolaroidCard

Multiple variants exist across screens:

**Standard (feed posts):**
- White background (`surface-container-lowest` / `#ffffff`)
- Small padding: `p-2 pb-6` to `p-3 pb-12` (side padding 8-12px, bottom 24-48px)
- Image fills most of card width
- Caption below image in handwritten font
- Varied aspect ratios: `3/4`, `4/5`, `square`

**Exact 88:107 (match screen, welcome, edit-profile):**
- `aspect-ratio: 88/107`
- Padding: `7.39% 5.11% 26.70% 5.11%` (exact Polaroid 600 spec)
- Image: `width: 89.77%; height: 72.00%; top: 7.39%; left: 5.11%`
- Caption centered in bottom white strip

**Asymmetric (discovery):**
- `padding: 10px 10px 30px 10px` (v1) or `12px 12px 48px 12px` (stack)
- Rounded corners: `rounded-xl`
- Image area: `aspect-square`

**Profile enhanced:**
- `p-2 pb-6` or `p-[8px] pb-[25px]`
- `aspect-[4/5]` for background cards
- `border border-black/5` subtle edge

**Chat inline Polaroid:**
- `polaroid-ratio w-64` (256px wide)
- `p-2 pb-8` padding
- Image `h-[72%]` of card
- `-rotate-1` slight tilt

### 2.2 PolaroidAvatar (Chat Inbox)

Mini Polaroid used as avatar:
- Container: `54px x 66px` (approximately 88:107)
- Padding: `4px 3px 14px 3px`
- Shadow: `0 4px 12px -2px rgba(46,21,0,0.12)`
- Stack layers behind: `rotate(-3deg)`, `rotate(4deg)`, with border `0.5px solid #EEDFDA`
- Tiny handwritten name at bottom: `text-[8px]`

### 2.3 PolaroidStack (Profile)

Multiple Polaroids layered with absolute positioning:
- 4-5 background cards at varied rotations: `-5deg` to `+6deg`
- Translations for scattered effect: `-6px` to `+4px`
- Opacity cascade: 0.6 to 1.0
- `perspective: 1000px` on container
- Front card slightly larger (w-72 to w-80 vs w-64)
- Swipe indicator dots below

### 2.4 TopAppBar

Glassmorphic header:
- `bg-[#fff8f6]/60 backdrop-blur-md` (or `/80`)
- Shadow: subtle warm charcoal
- Fixed positioning, z-50
- Content: back arrow + title + action button
- Title in Epilogue or Plus Jakarta Sans, copper color
- Icons: Material Symbols Outlined, copper tint

### 2.5 BottomNavBar

Floating glassmorphic dock:
- `bg-[#fff8f6]/80 backdrop-blur-xl rounded-t-[2rem]`
- Border: `border-t border-[#d8c3b4]/10` (ghost border)
- Shadow: `0 -8px 30px rgba(33,26,23,0.05)`
- 4 tabs: Discover, Messages, Feed, Profile
- Active tab: copper color, `scale-110`, filled icon
- Inactive: `text-[#211a17]/40`
- Labels: Plus Jakarta Sans, 10px, uppercase, tracking-widest
- Safe area padding: pb-8

### 2.6 StickyNote (Feed)

Yellow sticky note decoration:
- Background: `secondary-container/30` (gold/20)
- Padding: p-6
- Slight rotation: `-rotate-1`
- Push-pin effect: circular blur + solid circle at top center
- Handwritten font text

### 2.7 ChatBubble

- Received: `bg-[#F5F1EE] text-[#2C2421]`, `rounded-2xl rounded-bl-none`
- Sent: `copper-gradient text-white`, `rounded-2xl rounded-br-none`
- Max width: 85% of screen
- Timestamp below: `text-[10px] text-stone-400`
- Read receipt: `done_all` icon in primary color

### 2.8 MessageInput (Chat)

- Fixed bottom, glassmorphic: `bg-white/60 backdrop-blur-xl`
- Camera button left
- Rounded input: `rounded-full py-3 px-5`
- Heart emoji button inside input
- Send button: copper gradient, rounded-full, 48px

### 2.9 ActionButtons (Discovery)

Three-button row below Polaroid stack:
- Pass: 64px circle, white, tertiary X icon
- Star: 48px circle, gold tint, star icon
- Like: 80px circle, copper gradient, heart icon
- All have hover/active scale transforms

### 2.10 EditProfile PhotoGrid

- 3-column grid with `gap-4`
- Existing photos: Polaroid-framed with `polaroid-ratio`, `polaroid-frame` padding
- Slight rotations: `-2deg`, `3deg`, `-1deg`
- Empty slots: dashed border, `+` icon, hover state
- Header: "Your Gallery" + handwritten "scattered memories"

### 2.11 MatchCeremony

- Full-screen overlay with radial gradient background
- Two Polaroids: exact 88:107 aspect ratio
- Left card: `-rotate-[8deg] -translate-x-8`
- Right card: `rotate-[8deg] translate-x-8`
- Names in Caveat, centered in bottom strip
- Copper glow aura behind (blur-[100px])
- CTA buttons below: primary gradient + outlined secondary

### 2.12 WelcomeScreen

- Scattered Polaroids: 4-5 cards at various rotations and positions
- Each with exact `aspect-ratio: 88/107` and `7.39% 5.11% 26.70% 5.11%` padding
- Captions: "Sunday Coffee", "In the park", "Unfiltered", "Real moments"
- Lustre branding top center: bold uppercase tracking-widest
- Page dots (onboarding indicator)
- CTA: copper gradient full-width button

---

## 3. Layout Patterns

### 3.1 Feed Layout
- Vertical scroll, single column
- Max width: `max-w-md` (28rem / 448px)
- Cards scattered with varied rotations: `-3deg`, `2deg`, `-1deg`, `4deg`
- Varied card widths: full width or `w-4/5`
- Negative margins for overlap: `-mt-8`
- Large vertical gaps: `space-y-16` (64px)

### 3.2 Discovery Layout
- Full-screen centered single card
- `flex flex-col items-center justify-center`
- Peeking cards above/below (vertical stack flow)
- Or: stacked cards with absolute positioning (stack variant)
- Action buttons row below

### 3.3 Profile Layout
- Scrollable, full width
- Photo stack section: fixed height `h-[480px]-[520px]`
- Below: bio section, interests tags, action buttons
- Sections with `space-y-8`

### 3.4 Chat Inbox Layout
- Fixed header, scrollable list
- Search bar at top
- Message items: flex row with Polaroid avatar + text content
- Unread indicator: copper dot with glow

### 3.5 Chat Room Layout
- Fixed header with mini Polaroid avatar
- Messages: flex column, alternating alignment
- Inline Polaroid for shared photos
- Fixed input bar at bottom

---

## 4. Interactions and Animations

### 4.1 Hover/Active States
- Cards: `hover:rotate-0 transition-transform duration-500` (straighten)
- Ken Burns on images: `group-hover:scale-105 duration-700`
- Buttons: `active:scale-95 transition-transform`
- Nav items: `active:scale-90 duration-200`
- Polaroid stack hover: `hover:rotate-1 duration-300`
- Match Polaroids: `hover:scale-105 duration-500`

### 4.2 Implied Animations (for React Native)
- Card swipe gesture (discovery): vertical or horizontal
- Spring physics for card return/dismiss
- Polaroid scatter entrance (welcome screen)
- Match ceremony: cards slide in from sides with spring
- Particle/glow effects behind match
- Chat photo send: Polaroid tilt + fade in
- Stack navigation: card peel/flip

### 4.3 Transitions
- Color transitions: `transition-colors`, `transition-opacity`
- Transform transitions: `transition-transform`, `transition-all`
- Durations: 200ms (quick), 300ms (default), 500ms (slow), 700ms (Ken Burns)

---

## 5. Key Proportions Summary

### Polaroid Card Proportions Used

| Variant | Aspect | Side Pad | Top Pad | Bottom Pad | Where Used |
|---|---|---|---|---|---|
| Exact 600 | 88:107 | 5.11% | 7.39% | 26.70% | Match, Welcome, Edit Profile |
| Asymmetric v1 | ~3:4 | 10px | 10px | 30px | Discovery (vertical stack) |
| Asymmetric v2 | ~3:4 | 12px | 12px | 48px | Discovery (card stack) |
| Feed standard | varies | 8px | 8px | 24-48px | Feed posts |
| Profile | 4:5 | 8px | 8px | 24px | Profile stack |
| Chat inline | 88:107 | 8px | 8px | 32px | Chat room photo |
| Avatar mini | ~54:66 | 3px/4px | 4px | 14px | Chat inbox |

**Design decision:** The Stitch HTML is NOT consistent about using exact 88:107 everywhere. The match screen and welcome screen use exact spec. Feed and profile use approximate proportions. For F40, we should normalize to exact 88:107 for all Polaroid cards, using the Stitch designs as visual layout reference but enforcing spec proportions.

---

## 6. Screen-to-Component Mapping

| Stitch Screen | Target React Native Screen | Key Components |
|---|---|---|
| mobile-discovery.html | `apps/mobile/app/(tabs)/discover.tsx` | PolaroidProfileCard, VerticalStack |
| mobile-discovery-stack.html | (same, stack variant) | PolaroidStack, ActionButtons |
| mobile-feed.html | `apps/mobile/app/(tabs)/index.tsx` | PolaroidFeedCard, StickyNote |
| mobile-feed-revised.html | (same, final design) | PolaroidFeedCard (actions on card) |
| mobile-profile.html | `packages/app/src/screens/ProfileViewScreen` | PolaroidPhotoStack |
| mobile-profile-enhanced.html | (same, enhanced variant) | PolaroidPhotoStack (with swipe dots) |
| mobile-match.html | `packages/app/src/components/MatchAnimation` | MatchCeremony (two Polaroids) |
| mobile-chat-inbox.html | `apps/mobile/app/(tabs)/chat/index.tsx` | PolaroidAvatar, ConversationList |
| mobile-chat-room.html | `apps/mobile/app/(tabs)/chat/[conversationId].tsx` | ChatPolaroidPhoto, ChatBubble |
| mobile-welcome.html | `apps/mobile/app/(auth)/welcome.tsx` | ScatteredPolaroids |
| mobile-edit-profile.html | `packages/app/src/screens/ProfileEditScreen` | PolaroidPhotoGrid |
