# Epic: wave-2b-web-header

**Model:** haiku
**Wave:** 2
**Group:** A (parallel with 2a)

## Description

Replace the flat #E91E63 web header with a glassmorphism header. Left: LustreLogo component (from wave-1c). Center: 4 navigation links with icons (Discover, Connect, Explore, Learn). Right: notification bell + avatar dropdown with Profile, Settings, SafeDate, Vault, Logout. Sticky positioning, z-index 100. Graceful fallback for browsers without backdrop-filter support.

## Acceptance Criteria

1. Header background uses glassmorphism: `background: rgba(44,36,33,0.85)`, `backdropFilter: 'blur(12px) saturate(150%)'`, `borderBottom: '1px solid rgba(184,115,51,0.3)'` (copper tint).
2. Left section renders `LustreLogo` component with variant='dark' at 32px height.
3. Center section renders 4 navigation links with icons and labels: Discover, Connect, Explore, Learn. Active link highlighted with gold (#D4A843) underline or color.
4. Right section renders a notification bell icon (with unread badge) and an avatar dropdown menu.
5. Avatar dropdown contains 5 items: Profile, Settings, SafeDate, Vault, Logout — each navigating to the correct route.
6. Header is `position: sticky`, `top: 0`, `zIndex: 100`.
7. CSS `@supports` fallback: when `backdrop-filter` is not supported, background becomes `rgba(44,36,33,0.95)` (more opaque, no blur).
8. All inline styles from the current header are removed; styles use Tamagui theme tokens or CSS modules.

## File Paths

- `apps/web/app/(app)/layout.tsx`
- `apps/web/app/(app)/components/Header.tsx` (new — extracted header component)
- `apps/web/app/(app)/components/AvatarDropdown.tsx` (new)
- `apps/web/app/(app)/components/NavLink.tsx` (new)
