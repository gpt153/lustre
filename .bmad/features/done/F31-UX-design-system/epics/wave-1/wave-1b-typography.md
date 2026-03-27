# Epic: wave-1b-typography

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — depends on 1a for Tamagui config)

## Description

Register General Sans (heading) and Inter (body) font families in Tamagui with proper size/weight/line-height scales. Set up font loading for both Expo (expo-font) and Next.js (@next/font). Ensure no flash of unstyled text.

## Acceptance Criteria

1. General Sans variable font files are added to `packages/ui/src/fonts/` (GeneralSans-Variable.woff2 for web, GeneralSans-Variable.ttf for mobile).
2. Tamagui config registers `$heading` font family using `createFont()` with General Sans, sizes 14/16/18/20/24/28/32/40, weights 400/500/600/700, line-height scale 1.3x.
3. Tamagui config registers `$body` font family using `createFont()` with Inter, sizes 12/14/16/18/20, weights 400/500/600, line-height scale 1.5x.
4. Expo app loads fonts via `expo-font` in root layout — General Sans and Inter loaded before splash screen hides.
5. Next.js app loads General Sans via `next/font/local` and Inter via `next/font/google` in root layout with `display: 'swap'` and preload enabled.
6. A `$brand` font variant is defined for "Lustre" text: General Sans weight 600, letter-spacing 2px.
7. Existing `createInterFont` calls are replaced with the new font registrations.

## File Paths

- `packages/ui/src/tamagui.config.ts`
- `packages/ui/src/fonts/` (new directory with font files)
- `apps/mobile/app/_layout.tsx`
- `apps/web/app/layout.tsx`
