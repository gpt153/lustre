/**
 * Lustre Premium Copper/Gold Token Palette
 * Derived from the Lustre logo
 */

export const lustreColorTokens = {
  // Core Palette
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
  warmGray: '#8B7E74',

  // Accents
  ember: '#E05A33',
  sage: '#7A9E7E',

  // Semantic Aliases (backwards compat)
  primary: '#B87333', // copper
  primaryDark: '#D4A574', // copperLight
  primaryLight: '#E8B84B', // goldBright
  secondary: '#D4A574', // copperLight
  secondaryDark: '#C9973E', // goldDeep
  secondaryLight: '#E8B84B', // goldBright
}

export const lustreShadowTokens = {
  cardShadow: '0 2px 8px rgba(184, 115, 51, 0.15)',
  cardShadowDark: '0 2px 8px rgba(184, 115, 51, 0.25)',
}

export const lustreTokens = {
  color: lustreColorTokens,
  shadows: lustreShadowTokens,
}

export type LustreColorTokens = typeof lustreColorTokens
export type LustreShadowTokens = typeof lustreShadowTokens
export type LustreTokens = typeof lustreTokens
