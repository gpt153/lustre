# Epic: wave-1a-tokens-package

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — first)

## Description

Extend the existing `packages/tokens/` package with all remaining design token values currently living in `packages/ui/src/`. The package already has colors, spacing, and shadows. This epic adds: typography scale, border radii, animation timing constants, breakpoints, and theme variant color mappings (extracted from `packages/ui/src/themes.ts` without the Tamagui `createTheme` wrapper). The result is a complete, framework-agnostic design token package with zero UI dependencies.

## Acceptance Criteria

1. `packages/tokens/typography.ts` exports `TYPOGRAPHY` object with: `fontFamily: { heading: 'General Sans', body: 'Inter' }`, `fontSize` map (1-8 matching `packages/ui/src/fonts/index.ts` heading sizes), `fontWeight` map (regular=400, medium=500, semibold=600, bold=700), `lineHeight` map (tight=1.3, normal=1.5)
2. `packages/tokens/radii.ts` exports `RADII` object: `{ sm: 4, md: 8, lg: 12, xl: 16, full: 9999 }` as const
3. `packages/tokens/animation.ts` exports `ANIMATION` object with: `spring: { default: { damping: 20, stiffness: 300, mass: 1 }, bouncy: { damping: 12, stiffness: 400, mass: 0.8 }, gentle: { damping: 25, stiffness: 200, mass: 1 } }`, `duration: { fast: 150, normal: 250, slow: 400 }` as const
4. `packages/tokens/breakpoints.ts` exports `BREAKPOINTS` object: `{ sm: 640, md: 768, lg: 1024, xl: 1280 }` as const
5. `packages/tokens/themes.ts` exports `THEMES` object with `light_vanilla`, `light_spicy`, `dark_vanilla`, `dark_spicy` — each containing the same color mappings as `packages/ui/src/themes.ts` but as plain TS objects (no `createTheme`)
6. `packages/tokens/index.ts` re-exports all token modules (existing: COLORS, SPACING, SHADOWS; new: TYPOGRAPHY, RADII, ANIMATION, BREAKPOINTS, THEMES)
7. `packages/tokens/package.json` has zero dependencies on `tamagui`, `@tamagui/*`, `react-native`, or `react`
8. `tsc --noEmit` passes for `packages/tokens/` with no errors

## File Paths

- `packages/tokens/typography.ts`
- `packages/tokens/radii.ts`
- `packages/tokens/animation.ts`
- `packages/tokens/breakpoints.ts`
- `packages/tokens/themes.ts`
- `packages/tokens/index.ts`
- `packages/tokens/package.json`
- `packages/tokens/tsconfig.json`
