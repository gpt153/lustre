# Epic: E09 — Quick Create Bottom Sheet

## Stitch Source
Convert: `html/quick-create.html`
Reference: `screenshots/stitch-reference/quick-create.png`

## Description
Build the Quick Create bottom sheet that opens when the center FAB is tapped. Shows a dark overlay with blur, a white rounded sheet sliding up from the bottom with 6 action buttons in a 2-column grid. The FAB rotates 45 degrees to become an X (close) while the sheet is open.

## Acceptance Criteria
1. Dark overlay: bg-black at 40% opacity + backdrop-blur-sm
2. Sheet: white bg, rounded top corners (24px), handlebar at top
3. 2-column grid of 6 action buttons with 16px gap
4. Each button: 56px circle (surface-container bg) + Material icon + 12px label below
5. Actions: Nytt inlägg, Nytt meddelande, Skapa event, Ny grupp, SafeDate, Uppdatera intentioner
6. Center FAB animates: rotates 45° to become X icon while sheet is open
7. Tapping overlay or X closes the sheet with spring animation
8. Tapping an action closes sheet and navigates to corresponding screen
9. Sheet slides up with spring animation (damping ~15, stiffness ~150)

## File Paths
- `packages/ui/src/QuickCreateMenu.tsx`
- `packages/ui/src/index.ts` (export)
- `packages/ui/src/CenterFAB.tsx` (add rotation animation)
- `apps/mobile/app/(tabs)/_layout.tsx` (integrate sheet)

## Design Tokens (from Stitch)
- Overlay: rgba(0,0,0,0.40) + backdrop-blur 4px
- Sheet bg: #ffffff
- Sheet radius: 24px top corners
- Handlebar: 40px wide, 4px tall, surface-container-high (#f4e5e0), centered
- Action circle: 56px, bg surface-container (#faebe5)
- Action icon: 24px, primary-container color (#894D0D)
- Action label: 12px medium Manrope, on-surface (#211a17)
- Grid gap: 16px
- Sheet padding: 24px horizontal, 32px vertical
- FAB rotation: 0° → 45° (spring)
- Icons: edit (inlägg), chat (meddelande), event (event), group_add (grupp), shield (SafeDate), tune (intentioner)
