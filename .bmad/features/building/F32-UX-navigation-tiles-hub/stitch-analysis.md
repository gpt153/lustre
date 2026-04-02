# Stitch Analysis — F32 Navigation Tiles Hub

Stitch Project: `15975770183721364552` ("Lustre Navigation — Tiles Hub System")
Analyzed: 2026-04-02

## Design Tokens (extracted from Stitch HTML)

### Colors (Material 3 Copper Theme)

| Token | Hex | Usage |
|-------|-----|-------|
| primary | #6a3800 | Text emphasis, primary text |
| primary-container | #894d0d | Active tab, icons, badges, buttons |
| on-primary | #ffffff | Text on primary buttons |
| on-primary-container | #ffcaa1 | Light text on dark copper |
| secondary | #8c4f10 | Surface tint, gradient end |
| secondary-container | #fdad67 | Accent badges |
| surface | #fff8f6 | Main background (warm white) |
| surface-container | #faebe5 | Card/tile backgrounds |
| surface-container-low | #fff1eb | Lighter card variant |
| surface-container-lowest | #ffffff | Polaroid card backgrounds |
| surface-container-high | #f4e5e0 | Elevated surfaces |
| surface-container-highest | #eee0da | Highest elevation |
| on-surface | #211a17 | Primary text |
| on-surface-variant | #524439 | Secondary text |
| outline | #857467 | Muted text, inactive icons |
| outline-variant | #d8c3b4 | Borders, dividers |
| error | #ba1a1a | Error/logout actions |

### Gradients

| Name | CSS | Usage |
|------|-----|-------|
| copper-glow | `linear-gradient(135deg, #894D0D 0%, #8C4F10 100%)` | Center FAB, primary buttons, like button |

### Shadows

| Name | CSS | Usage |
|------|-----|-------|
| sunlight-shadow | `0 8px 32px rgba(33, 26, 23, 0.08)` | Cards, tiles |
| polaroid-shadow | `0 4px 12px rgba(33, 26, 23, 0.08)` | Polaroid cards |
| nav-shadow | `0 -8px 24px rgba(33, 26, 23, 0.06)` | Bottom nav bar upward shadow |
| fab-shadow | `0 8px 24px rgba(137, 77, 13, 0.3)` | Center action button |

### Typography

| Element | Font | Weight | Size | Tracking |
|---------|------|--------|------|----------|
| Header title | Manrope | 800 (extrabold) | 20px (lg) | tight (-0.02em) |
| Section title | Manrope | 700 (bold) | 18px | tight |
| Card title | Manrope | 700 (bold) | 16px | tight |
| Body text | Manrope | 500 (medium) | 14px | normal |
| Tab label | Manrope | 500 (medium) | 10px | wide (uppercase) |
| Caption/subtitle | Manrope | 400-500 | 12px | normal |
| Badge text | Manrope | 700 (bold) | 10-11px | wide |
| Polaroid caption | Manrope | 500 (medium) | 18px italic | tight |

### Spacing & Layout

| Element | Value |
|---------|-------|
| Screen padding horizontal | 24px (px-6) |
| Card border-radius | 16px (rounded-lg/xl) |
| Pill border-radius | 9999px (full) |
| Bottom nav height | 80px (h-20) |
| Bottom nav corner radius | 24px (rounded-t-3xl) |
| Center FAB size | 56px (w-14 h-14) |
| Center FAB elevation | -24px (-top-6 or -translate-y-6) |
| Tab icon size | 24px |
| Avatar size (chat list) | 48px (w-12) |
| Avatar size (match row) | 56px (w-14) |
| Tile grid gap | 16px (gap-4) |
| Masonry grid | 2 columns, 16px gap |

### Border Details

| Element | Border |
|---------|--------|
| Polaroid card | 1px solid rgba(216, 195, 180, 0.15) |
| Bottom nav top | 1px border-outline-variant/30 |
| Active tab indicator | 4px dot below icon (w-1 h-1 rounded-full) |
| Center FAB border | 4px white border (border-4 border-white) |
| Intention pills | 1px border-outline-variant |
| Dividers | 1px outline-variant/30 |

## Component Inventory

### 1. BottomNavBar
- 5 tabs: Upptäck (explore) · Community (group) · Center FAB (+) · Chatt (chat_bubble) · Jag (person)
- Material Symbols Outlined icons, 24px
- Active state: primary-container color (#894D0D) + filled icon + dot indicator
- Inactive state: outline color (#857467)
- Center FAB: copper-glow gradient, 56px circle, elevated -24px, white + icon
- Background: surface-container-low/80 with backdrop-blur-xl
- Rounded top corners (3xl = 24px)

### 2. TilesHub (used in Upptäck + Community)
- 2-column masonry grid
- Hero tile: full-width or 60% width, aspect-ratio 4/3, with overlay gradient + image
- Standard tiles: aspect-square, white background, icon + title + subtitle
- Each tile: rounded-lg, polaroid-card shadow, border
- Icons: 40px circle background (surface-container) with primary-container icon

### 3. PolaroidPost (Feed)
- White card (surface-container-lowest), 12px padding, larger bottom padding
- Inner photo: aspect-square or 4/5, rounded-sm
- Optional washi tape decoration (top center)
- Slight rotation (rotate-1 or -rotate-2)
- Caption in italic Manrope, primary color
- Engagement row: heart + comment + bookmark icons

### 4. SwipeCard (Swipe View)
- Polaroid frame: 12px padding, 40px bottom padding (pb-10)
- Photo: aspect 4/5
- Slight rotation: -1.5deg
- Name + age in extrabold 24px
- Location with pin icon
- Match % badge (top-right of photo)
- Intent pill badge (bottom-right, copper bg)
- Action buttons: 5 circular buttons (rewind 40px, pass 52px, super-like 64px copper, like 52px copper, boost 40px)

### 5. IntentionPills (Intentions View)
- Horizontal scrollable row
- Active: copper gradient bg, white text, shadow
- Inactive: border outline-variant, bg surface-container-lowest
- Emoji + text label
- Rounded-full

### 6. ConversationList (Chatt)
- Section 1: "Nya matchningar" — horizontal scroll of 56px avatars with copper ring border, copper dot for new
- Section 2: "Konversationer" — vertical list rows
- Row: 48px avatar + name (bold) + message preview + timestamp + unread badge
- Unread badge: primary-container bg, white text, 20px circle
- Typing indicator: italic primary-container color "skriver..."
- Online indicator: green dot (bottom-right of avatar)

### 7. ProfilePage (Jag)
- Hero: 96px avatar with copper ring + verified badge
- Name, age, location centered
- Bio in italic
- "Redigera profil" outlined button
- Stats row: 3 stats with dividers in surface-container-low card
- Posts grid: 3-column Polaroid thumbnails with tilt
- Collections: list items with 40px icon circles + count badges
- Quick links: icon + text button list
- Logout: error color

### 8. QuickCreateMenu (Center Action)
- Bottom sheet overlay: bg-black/40 + backdrop-blur-sm
- Sheet: white bg, rounded-t-24px, handlebar at top
- 2-column grid of action buttons
- Each: 56px circle (surface-container bg) + icon + 12px label below
- 6 actions: Nytt inlägg, Nytt meddelande, Skapa event, Ny grupp, SafeDate, Uppdatera intentioner
- Center FAB rotates 45° to become X (close)

## Screen-to-File Mapping (Mobile — React Native)

| Stitch Screen | Target File | Type |
|--------------|-------------|------|
| bottom-nav-spec | apps/mobile/app/(tabs)/_layout.tsx | Complete rewrite |
| bottom-nav-spec | packages/ui/src/BottomNavBar.tsx | New shared component |
| upptack-hub | apps/mobile/app/(tabs)/discover.tsx | Complete rewrite |
| community-hub | apps/mobile/app/(tabs)/community.tsx | Complete rewrite |
| chatt | apps/mobile/app/(tabs)/chat.tsx | Complete rewrite |
| jag-profil | apps/mobile/app/(tabs)/profile.tsx | Complete rewrite |
| swipe-view | apps/mobile/app/(tabs)/discover/swipe.tsx | New screen |
| intentions-view | apps/mobile/app/(tabs)/discover/intentions.tsx | New screen |
| quick-create | packages/ui/src/QuickCreateMenu.tsx | New component |
| flode-feed | apps/mobile/app/(tabs)/community/feed.tsx | New screen |

## Conversion Strategy (HTML → React Native)

### Layout
- Tailwind flex/grid → React Native StyleSheet flexbox
- `gap-4` → `gap: 16` in styles
- `px-6` → `paddingHorizontal: 24`
- `rounded-xl` → `borderRadius: 20`
- `aspect-[4/5]` → `aspectRatio: 4/5`

### Components
- `<nav>` bottom bar → Custom TabBar component replacing Expo Router's default
- `<img>` → `<Image>` from expo-image or react-native
- `<button>` → `<Pressable>` with `active:scale-95` → Animated scale
- Material Symbols → @expo/vector-icons MaterialCommunityIcons or custom SVG
- backdrop-blur → expo-blur `<BlurView>`
- Linear gradient → expo-linear-gradient

### Interactions
- Tile tap → Stack navigation push (expo-router `router.push`)
- Back arrow → `router.back()`
- Center FAB → Bottom sheet modal (react-native-bottom-sheet or custom)
- Swipe gestures → react-native-gesture-handler + reanimated
- Horizontal scroll → FlatList horizontal

### Design System Alignment
- Colors map directly to existing Lustre theme tokens
- Manrope font already loaded in app
- PolaroidCard component exists in packages/ui — extend/reuse
- PaperTextureBackground exists — use for screen backgrounds
