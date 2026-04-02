# Epic: E01 — Bottom Nav Bar Component

## Stitch Source
Convert: `html/bottom-nav-spec.html`
Reference: `screenshots/stitch-reference/bottom-nav-spec.png`

## Description
Create a new BottomNavBar component that renders 5 tab slots: Upptäck, Community, Center FAB (placeholder), Chatt, Jag. This replaces the current broken PolaroidTabBar. The component receives expo-router tab bar props and renders a custom bar with glassmorphism background, rounded top corners, and copper active state with dot indicator.

## Acceptance Criteria
1. Component renders 5 tap targets: 4 regular tabs + 1 center FAB placeholder slot
2. Active tab icon uses primary-container color (#894D0D) with filled weight
3. Inactive tab icons use outline color (#857467) with light weight
4. Active tab shows a 4px copper dot indicator below the icon
5. Tab labels: uppercase 10px Manrope medium with wide letter-spacing
6. Background uses BlurView (iOS) / solid surface-container-low fallback (Android)
7. Rounded top corners at 24px (rounded-t-3xl), nav-shadow upward
8. Ghost border top: 1px outline-variant at 30% opacity
9. Bar height 80px plus safe area bottom inset
10. All touch targets meet 44px minimum accessibility requirement

## File Paths
- `packages/ui/src/BottomNavBar.tsx`
- `packages/ui/src/index.ts` (export)

## Design Tokens (from Stitch)
- Active color: `#894D0D` (primary-container)
- Inactive color: `#857467` (outline)
- Background: `rgba(255,241,235,0.80)` (surface-container-low/80) + backdrop-blur-xl
- Android bg: `rgba(255,241,235,0.92)`
- Top border: `rgba(216,195,180,0.30)` (outline-variant/30)
- Shadow: `0 -8px 24px rgba(33,26,23,0.06)` (nav-shadow)
- Corner radius: 24px top-left + top-right
- Icon size: 24px
- Label: 10px, weight 500, letterSpacing 2
- Dot: 4px circle, primary-container color
- Icons: Material — explore, group, add (FAB), chat_bubble, person
