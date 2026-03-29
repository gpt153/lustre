# Epic 1b: Caveat Font

**Model:** haiku
**Wave:** 1
**Depends on:** nothing

## Description
Install Caveat Google Font and add it to the Expo font loader.

## Acceptance Criteria
1. `@expo-google-fonts/caveat` installed in `packages/ui/`
2. `packages/ui/src/fonts/expo-loader.ts` imports `Caveat_400Regular` and `Caveat_700Bold`
3. `loadLustreFonts()` loads both Caveat fonts alongside existing Noto Serif + Manrope fonts
4. No breaking changes to existing font loading

## File Paths
- `packages/ui/package.json` (EDIT — add dependency)
- `packages/ui/src/fonts/expo-loader.ts` (EDIT — add Caveat imports and loading)
