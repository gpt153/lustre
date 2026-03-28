/**
 * Lustre Custom Themes (Light/Dark + Vanilla/Spicy)
 * Updated to stitch design system specification
 */

import { createTheme } from 'tamagui'
import { lustreColorTokens } from './tokens'

/**
 * Light Theme - Vanilla
 * Stitch surface hierarchy with ghost borders and ultra-diffused shadows
 */
export const light_vanilla = createTheme({
  background: lustreColorTokens.surface,
  backgroundFocus: lustreColorTokens.surfaceContainerHigh,
  backgroundHover: lustreColorTokens.surfaceContainerLow,
  backgroundPress: lustreColorTokens.surfaceContainer,
  backgroundDisabled: lustreColorTokens.surfaceContainerHighest,
  borderColor: lustreColorTokens.ghostBorder,
  color: lustreColorTokens.onSurface,
  colorFocus: lustreColorTokens.onSurface,
  colorHover: lustreColorTokens.onSurface,
  colorPress: lustreColorTokens.onSurface,
  colorDisabled: lustreColorTokens.onSurfaceVariant,
  colorTransparent: 'rgba(29, 27, 25, 0.5)',
  placeholderColor: lustreColorTokens.onSurfaceVariant,
  primary: lustreColorTokens.copper,
  primaryDark: lustreColorTokens.primaryContainer,
  primaryLight: lustreColorTokens.goldBright,
  secondary: lustreColorTokens.secondary,
  secondaryDark: lustreColorTokens.goldDeep,
  secondaryLight: lustreColorTokens.secondaryContainer,
  accent: lustreColorTokens.gold,
  accentBackground: lustreColorTokens.surfaceContainerLowest,
  modeAccent: lustreColorTokens.sage,
  shadow: 'rgba(44, 36, 33, 0.04)',
  shadowColor: 'rgba(44, 36, 33, 0.06)',
  // Stitch extended surface tokens
  surfaceContainerLow: lustreColorTokens.surfaceContainerLow,
  surfaceContainerHigh: lustreColorTokens.surfaceContainerHigh,
  onSurfaceVariant: lustreColorTokens.onSurfaceVariant,
  outline: lustreColorTokens.outline,
  outlineVariant: lustreColorTokens.outlineVariant,
  ghostBorder: lustreColorTokens.ghostBorder,
})

/**
 * Light Theme - Spicy
 * Same as vanilla light, but with ember accent
 */
export const light_spicy = createTheme({
  ...light_vanilla,
  modeAccent: lustreColorTokens.ember,
})

/**
 * Dark Theme - Vanilla
 * Stitch dark surface hierarchy with ultra-diffused shadows
 */
export const dark_vanilla = createTheme({
  background: '#1e1b18',
  backgroundFocus: '#2d2a26',
  backgroundHover: '#221f1c',
  backgroundPress: '#383430',
  backgroundDisabled: '#1e1b18',
  borderColor: 'rgba(107, 79, 58, 0.25)',
  color: '#ede0d4',
  colorFocus: '#ede0d4',
  colorHover: '#ede0d4',
  colorPress: '#ede0d4',
  colorDisabled: '#B0A49E',
  colorTransparent: 'rgba(237, 224, 212, 0.5)',
  placeholderColor: '#B0A49E',
  primary: lustreColorTokens.copperLight,
  primaryDark: lustreColorTokens.copper,
  primaryLight: lustreColorTokens.goldBright,
  secondary: lustreColorTokens.goldBright,
  secondaryDark: lustreColorTokens.goldDeep,
  secondaryLight: lustreColorTokens.copper,
  accent: lustreColorTokens.goldBright,
  accentBackground: '#2d2a26',
  modeAccent: lustreColorTokens.sage,
  shadow: 'rgba(44, 36, 33, 0.04)',
  shadowColor: 'rgba(44, 36, 33, 0.06)',
  // Stitch extended surface tokens
  surfaceContainerLow: '#1e1b18',
  surfaceContainerHigh: '#2d2a26',
  onSurfaceVariant: '#B0A49E',
  outline: '#6B4F3A',
  outlineVariant: '#3D3330',
  ghostBorder: 'rgba(107, 79, 58, 0.25)',
})

/**
 * Dark Theme - Spicy
 * Same as vanilla dark, but with ember accent
 */
export const dark_spicy = createTheme({
  ...dark_vanilla,
  modeAccent: lustreColorTokens.ember,
})

/**
 * Base light/dark themes (default to vanilla)
 * Tamagui resolves <Theme name="light"> to the `light` key.
 * Sub-themes like light_vanilla are resolved when <Theme name="vanilla">
 * is nested inside <Theme name="light">.
 */
export const light = light_vanilla
export const dark = dark_vanilla

/**
 * Exported themes for Tamagui config
 */
export const lustreThemes = {
  light,
  dark,
  light_vanilla,
  light_spicy,
  dark_vanilla,
  dark_spicy,
}

export type LustreTheme = keyof typeof lustreThemes
