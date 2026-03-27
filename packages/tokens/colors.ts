/**
 * Lustre Brand Color Tokens
 *
 * Re-exports the canonical brand palette from @lustre/ui, then defines
 * mode-specific color sets (vanilla light/dark, spicy light/dark).
 *
 * Pure TypeScript constants — no runtime, no provider.
 */

// ---------------------------------------------------------------------------
// Brand palette (canonical source of truth lives in @lustre/ui/src/tokens.ts;
// we re-declare here as plain constants so @lustre/tokens has zero dep on
// Tamagui and can be tree-shaken by Hermes without pulling in the full design
// system).
// ---------------------------------------------------------------------------

export const COLORS = {
  // Core
  copper: '#B87333',
  copperLight: '#D4A574',
  copperMuted: '#C4956A',
  gold: '#D4A843',
  goldBright: '#E8B84B',
  goldDeep: '#C9973E',

  // Neutrals
  warmWhite: '#FDF8F3',
  warmCream: '#F5EDE4',
  charcoal: '#2C2421',
  warmGray: '#8B7E75',

  // Accents
  ember: '#C85A3A',
  sage: '#7A9E7E',
} as const

// ---------------------------------------------------------------------------
// Mode-specific color sets
// ---------------------------------------------------------------------------

export const COLORS_VANILLA_LIGHT = {
  background: '#FDF8F3',
  surface: '#F5EDE4',
  surfaceElevated: '#FFFBF7',
  border: '#C4956A',
  borderSubtle: '#E8DDD4',
  text: '#2C2421',
  textSecondary: '#8B7E75',
  textDisabled: '#B0A49E',
  accent: '#B87333',
  accentLight: '#D4A574',
  accentSubtle: '#F0E4D4',
  destructive: '#C85A3A',
  success: '#7A9E7E',
} as const

export const COLORS_VANILLA_DARK = {
  background: '#1A1210',
  surface: '#2C2421',
  surfaceElevated: '#382F2B',
  border: '#6B4F3A',
  borderSubtle: '#3D3330',
  text: '#FDF8F3',
  textSecondary: '#B0A49E',
  textDisabled: '#6B5E58',
  accent: '#D4A574',
  accentLight: '#E8C49A',
  accentSubtle: '#3D2F22',
  destructive: '#E07B5A',
  success: '#9DBE9F',
} as const

export const COLORS_SPICY_LIGHT = {
  background: '#FDF4F8',
  surface: '#F8EAF2',
  surfaceElevated: '#FFF8FC',
  border: '#C4708A',
  borderSubtle: '#EDD4E0',
  text: '#2C2421',
  textSecondary: '#8B7075',
  textDisabled: '#B0A0A4',
  accent: '#B83370',
  accentLight: '#D4748A',
  accentSubtle: '#F5D0DF',
  destructive: '#C85A3A',
  success: '#7A9E7E',
} as const

export const COLORS_SPICY_DARK = {
  background: '#1A1015',
  surface: '#2C1E24',
  surfaceElevated: '#38272F',
  border: '#7A3A52',
  borderSubtle: '#3D2530',
  text: '#FDF8FB',
  textSecondary: '#B09EA6',
  textDisabled: '#6B5058',
  accent: '#D47494',
  accentLight: '#E8A4B4',
  accentSubtle: '#3D1E2A',
  destructive: '#E07B5A',
  success: '#9DBE9F',
} as const

export type ColorKey = keyof typeof COLORS
export type ColorValue = (typeof COLORS)[ColorKey]
export type ModeColorSet =
  | typeof COLORS_VANILLA_LIGHT
  | typeof COLORS_VANILLA_DARK
  | typeof COLORS_SPICY_LIGHT
  | typeof COLORS_SPICY_DARK
