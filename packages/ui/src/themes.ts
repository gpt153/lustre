/**
 * Lustre Custom Themes (Light/Dark + Vanilla/Spicy)
 */

import { createTheme } from 'tamagui'
import { lustreColorTokens } from './tokens'

/**
 * Light Theme - Vanilla
 * Warm, inviting palette with copper primary and gold accents
 */
export const light_vanilla = createTheme({
  background: lustreColorTokens.warmWhite,
  backgroundFocus: lustreColorTokens.warmCream,
  backgroundHover: lustreColorTokens.warmCream,
  backgroundPress: '#F0E8DB',
  backgroundDisabled: '#EFEFEF',
  borderColor: lustreColorTokens.copperMuted,
  color: lustreColorTokens.charcoal,
  colorFocus: lustreColorTokens.charcoal,
  colorHover: lustreColorTokens.charcoal,
  colorPress: lustreColorTokens.charcoal,
  colorDisabled: lustreColorTokens.warmGray,
  colorTransparent: 'rgba(44, 36, 33, 0.5)',
  placeholderColor: lustreColorTokens.warmGray,
  primary: lustreColorTokens.copper,
  primaryDark: lustreColorTokens.copperLight,
  primaryLight: lustreColorTokens.goldBright,
  secondary: lustreColorTokens.copperLight,
  secondaryDark: lustreColorTokens.goldDeep,
  secondaryLight: lustreColorTokens.goldBright,
  accent: lustreColorTokens.gold,
  accentBackground: '#FEF9F0',
  modeAccent: lustreColorTokens.sage,
  shadow: 'rgba(184, 115, 51, 0.08)',
  shadowColor: 'rgba(184, 115, 51, 0.12)',
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
 * Rich, premium dark palette with copper and gold highlights
 */
export const dark_vanilla = createTheme({
  background: '#1A1614',
  backgroundFocus: lustreColorTokens.charcoal,
  backgroundHover: '#3D332E',
  backgroundPress: '#4A3E38',
  backgroundDisabled: '#2A2420',
  borderColor: '#3D332E',
  color: lustreColorTokens.warmCream,
  colorFocus: lustreColorTokens.warmCream,
  colorHover: lustreColorTokens.warmCream,
  colorPress: lustreColorTokens.warmCream,
  colorDisabled: '#8B7E74',
  colorTransparent: 'rgba(245, 237, 228, 0.5)',
  placeholderColor: '#8B7E74',
  primary: lustreColorTokens.copperLight,
  primaryDark: lustreColorTokens.copper,
  primaryLight: lustreColorTokens.goldBright,
  secondary: lustreColorTokens.goldBright,
  secondaryDark: lustreColorTokens.goldDeep,
  secondaryLight: lustreColorTokens.copper,
  accent: lustreColorTokens.goldBright,
  accentBackground: '#3D3228',
  modeAccent: lustreColorTokens.sage,
  shadow: 'rgba(184, 115, 51, 0.15)',
  shadowColor: 'rgba(184, 115, 51, 0.25)',
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
