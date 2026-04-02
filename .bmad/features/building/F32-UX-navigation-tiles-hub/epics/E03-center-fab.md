# Epic: E03 — Center FAB Button

## Stitch Source
Convert: `html/bottom-nav-spec.html`
Reference: `screenshots/stitch-reference/bottom-nav-spec.png`

## Description
Create the elevated center FAB (Floating Action Button) that sits in the middle of the bottom nav bar, elevated above it. The button uses a copper gradient, white border, and plus icon. In Wave 1 it logs a press; in Wave 3 it will open the QuickCreateMenu.

## Acceptance Criteria
1. 56px circle with copper-glow gradient background (135deg, #894D0D → #8C4F10)
2. Elevated -24px above the nav bar (visually floating)
3. White 4px border around the circle
4. White plus (+) icon centered, 28px
5. fab-shadow: `0 8px 24px rgba(137,77,13,0.3)`
6. Press animation: scale down to 0.9 with spring physics
7. Accessible: role "button", label "Skapa nytt"
8. Accepts onPress callback (for QuickCreateMenu integration in W3)

## File Paths
- `packages/ui/src/CenterFAB.tsx`
- `packages/ui/src/index.ts` (export)

## Design Tokens (from Stitch)
- Size: 56px (w-14 h-14)
- Gradient: `linear-gradient(135deg, #894D0D 0%, #8C4F10 100%)`
- Border: 4px white
- Shadow: `0 8px 24px rgba(137,77,13,0.3)`
- Elevation: -24px (translate-y)
- Icon: white, 28px, Material "add"
- Press scale: 0.9
