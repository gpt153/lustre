# Epic: wave-3b-button-inputs

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3a, 3c)

## Description

Redesign LustreButton and text input components with the new design system. Buttons get updated colors (gold primary, copper secondary), increased borderRadius (12), and Reanimated press animation (scale 0.95 with spring). Text inputs get warm tones, copper focus ring, and rounded corners.

## Acceptance Criteria

1. `LustreButton` primary variant: backgroundColor gold (#D4A843), text color charcoal (#2C2421), borderRadius 12. On press: goldDeep (#C9973E).
2. `LustreButton` secondary variant: transparent background, copper (#B87333) border (1px), copper text. On press: copperLight fill.
3. `LustreButton` press animation: Reanimated `useAnimatedStyle` with `withSpring(0.95, { damping: 10, stiffness: 200 })` on press, spring back to 1.0 on release.
4. `LustreButton` danger variant: ember (#E05A33) background for destructive actions.
5. Text input component uses: borderRadius 12, border 1px copperMuted, background warmWhite (light) / surface (dark). On focus: border changes to copper (#B87333) with 2px width.
6. Placeholder text uses warmGray (#8B7E74).
7. All button and input components work in both light and dark modes.

## File Paths

- `packages/ui/src/LustreButton.tsx`
- `packages/ui/src/LustreInput.tsx` (new or existing text input component)
