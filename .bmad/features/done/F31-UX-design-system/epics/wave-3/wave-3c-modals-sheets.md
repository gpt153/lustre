# Epic: wave-3c-modals-sheets

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3a, 3b)

## Description

Redesign modal and bottom sheet overlays with glassmorphism backdrop, spring slide-up animation, warmCream content background, and rounded top corners. Create shared ModalBase and BottomSheetBase components for consistent usage across the app.

## Acceptance Criteria

1. `ModalBase` component exists in `packages/ui/` with glassmorphism backdrop: `backgroundColor: 'rgba(44,36,33,0.6)'`, `backdropFilter: 'blur(8px)'`. Content container: warmCream background, borderRadius 20, centered on screen.
2. `BottomSheetBase` component exists in `packages/ui/` with same glassmorphism backdrop. Content slides up from bottom with spring animation: `withSpring(0, { damping: 25, stiffness: 100 })`. Top corners borderRadius 20, drag-to-dismiss handle (4px high, 40px wide, copperMuted bar).
3. Modal entrance animation: fade-in backdrop (200ms) + scale content from 0.95 to 1.0 with spring.
4. Modal exit animation: fade-out backdrop + scale content to 0.95.
5. Both components accept `onClose` callback and close on backdrop tap.
6. Both components support dark mode (dark surface background for content in dark mode).
7. On platforms without backdrop-filter support, backdrop falls back to solid rgba(44,36,33,0.85).

## File Paths

- `packages/ui/src/ModalBase.tsx` (new)
- `packages/ui/src/BottomSheetBase.tsx` (new)
