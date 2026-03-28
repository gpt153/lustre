/**
 * Lustre Premium Copper/Gold Token Palette
 * Updated to stitch design system specification
 */

export const lustreColorTokens = {
  // Core Palette — stitch primary
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
  warmGray: '#8B7E74',

  // Accents
  ember: '#E05A33',
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

  // Semantic Aliases (backwards compat)
  primary: '#894d0d', // stitch primary
  primaryDark: '#D4A574', // copperLight
  primaryLight: '#E8B84B', // goldBright
  secondaryDark: '#C9973E', // goldDeep
  secondaryLight: '#E8B84B', // goldBright
} as const

// Stitch gradient definition
export const lustreGradientTokens = {
  copperGradient: {
    start: '#894d0d',
    end: '#a76526',
    angle: 135,
  },
} as const

// Ultra-diffused shadow tokens — max 0.06 opacity
export const lustreShadowTokens = {
  sm: '0 4px 8px rgba(44, 36, 33, 0.04)',
  md: '0 8px 24px rgba(44, 36, 33, 0.06)',
  lg: '0 12px 40px rgba(44, 36, 33, 0.06)',
  xl: '0 16px 48px rgba(44, 36, 33, 0.06)',
} as const

// Roundness tokens
export const lustreRoundnessTokens = {
  full: 9999,
  xl: 48,
  lg: 32,
  md: 16,
  sm: 8,
} as const

// Typography tokens
export const lustreTypographyTokens = {
  fontHeading: 'NotoSerif',
  fontBody: 'Manrope',
} as const

export const lustreTokens = {
  color: lustreColorTokens,
  shadows: lustreShadowTokens,
  gradients: lustreGradientTokens,
  roundness: lustreRoundnessTokens,
  typography: lustreTypographyTokens,
} as const

export type LustreColorTokens = typeof lustreColorTokens
export type LustreShadowTokens = typeof lustreShadowTokens
export type LustreGradientTokens = typeof lustreGradientTokens
export type LustreRoundnessTokens = typeof lustreRoundnessTokens
export type LustreTypographyTokens = typeof lustreTypographyTokens
export type LustreTokens = typeof lustreTokens
