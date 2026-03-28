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
  // Core — stitch primary
  copper: '#894d0d',
  copperLight: '#D4A574',
  copperMuted: '#C4956A',
  gold: '#D4A843',
  goldBright: '#E8B84B',
  goldDeep: '#C9973E',

  // Stitch primary container
  primaryContainer: '#a76526',

  // Neutrals
  warmWhite: '#FDF8F3',
  warmCream: '#F5EDE4',
  charcoal: '#2C2421',
  warmGray: '#8B7E75',

  // Accents
  ember: '#C85A3A',
  sage: '#7A9E7E',

  // Stitch surface hierarchy
  surface: '#fef8f3',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f8f3ee',
  surfaceContainer: '#f2ede8',
  surfaceContainerHigh: '#ece7e2',
  surfaceContainerHighest: '#e6e2dd',
  surfaceDim: '#ded9d4',
  surfaceVariant: '#e6e2dd',

  // Stitch on-colors (never #000000)
  onSurface: '#1d1b19',
  onSurfaceVariant: '#524439',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',

  // Stitch outline
  outline: '#857467',
  outlineVariant: '#d8c3b4',

  // Ghost border
  ghostBorder: 'rgba(216, 195, 180, 0.20)',

  // Stitch secondary colors
  secondary: '#795900',
  secondaryContainer: '#fece65',
  tertiary: '#9f3c1e',
  tertiaryContainer: '#ffb4a1',
} as const

// ---------------------------------------------------------------------------
// Mode-specific color sets
// ---------------------------------------------------------------------------

export const COLORS_VANILLA_LIGHT = {
  background: '#fef8f3',
  surface: '#fef8f3',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f8f3ee',
  surfaceContainer: '#f2ede8',
  surfaceContainerHigh: '#ece7e2',
  surfaceContainerHighest: '#e6e2dd',
  surfaceDim: '#ded9d4',
  surfaceElevated: '#ffffff',
  border: '#857467',
  borderSubtle: '#d8c3b4',
  ghostBorder: 'rgba(216, 195, 180, 0.20)',
  text: '#1d1b19',
  textSecondary: '#524439',
  textDisabled: '#B0A49E',
  accent: '#894d0d',
  accentLight: '#a76526',
  accentSubtle: '#F0E4D4',
  destructive: '#C85A3A',
  success: '#7A9E7E',
} as const

export const COLORS_VANILLA_DARK = {
  background: '#1A1210',
  surface: '#1e1b18',
  surfaceContainerLowest: '#131110',
  surfaceContainerLow: '#1e1b18',
  surfaceContainer: '#221f1c',
  surfaceContainerHigh: '#2d2a26',
  surfaceContainerHighest: '#383430',
  surfaceDim: '#141210',
  surfaceElevated: '#382F2B',
  border: '#6B4F3A',
  borderSubtle: '#3D3330',
  ghostBorder: 'rgba(107, 79, 58, 0.25)',
  text: '#ede0d4',
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
  surface: '#FDF4F8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#F9EEF4',
  surfaceContainer: '#F3E8EF',
  surfaceContainerHigh: '#EDE2E9',
  surfaceContainerHighest: '#E7DCE3',
  surfaceDim: '#DFD6DC',
  surfaceElevated: '#FFF8FC',
  border: '#C4708A',
  borderSubtle: '#EDD4E0',
  ghostBorder: 'rgba(196, 112, 138, 0.20)',
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
  surfaceContainerLowest: '#130C11',
  surfaceContainerLow: '#1F1419',
  surfaceContainer: '#251820',
  surfaceContainerHigh: '#30232A',
  surfaceContainerHighest: '#3B2D34',
  surfaceDim: '#120C10',
  surfaceElevated: '#38272F',
  border: '#7A3A52',
  borderSubtle: '#3D2530',
  ghostBorder: 'rgba(122, 58, 82, 0.25)',
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
