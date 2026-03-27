# Epic: wave-6c-dark-mode-polish

**Model:** haiku
**Wave:** 6
**Group:** B (sequential — after 6a and 6b)

## Description

Audit all screens in dark mode to ensure consistent use of warm dark tones. Fix any hardcoded color values that bypass the theme system. Verify that the dark mode palette (warm black #1A1614, charcoal #2C2421, surfaceUp #3D332E) is applied consistently. Ensure goldBright (#E8B84B) is used as the primary accent in dark mode for visibility.

## Acceptance Criteria

1. No hardcoded `#FFFFFF` (white) or `#000000` (black) values remain in any themed component — all use Tamagui tokens ($background, $color, $surface, etc.).
2. No hardcoded `#E91E63` (old pink), `#F5F5F5` (old surface), or `#212121` (old text) values remain anywhere in the codebase.
3. Dark mode background is consistently #1A1614 across all screens (not Material Design #121212 or #1E1E1E).
4. Dark mode surface (cards, inputs) is consistently #2C2421.
5. Elevated surfaces in dark mode (dropdowns, popovers, toasts) use surfaceUp #3D332E.
6. Primary accent in dark mode is goldBright (#E8B84B) — verified on buttons, links, active states, badges.
7. Copper text/icons use copperLight (#D4A574) in dark mode for adequate contrast (>4.5:1 ratio on dark backgrounds).
8. All gradient overlays on photos remain readable in dark mode.

## File Paths

- `packages/ui/src/` (all component files)
- `packages/app/src/screens/` (all screen files)
- `packages/app/src/components/` (all component files)
- `apps/web/app/(app)/` (all web page files)
- `apps/mobile/app/(tabs)/` (all mobile tab files)
