/**
 * Lustre Design Token Reference
 *
 * TypeScript constants mirroring the CSS custom properties in styles/tokens.css.
 * Use these for:
 *   - Inline styles when CSS class is not practical
 *   - JavaScript animation values (Framer Motion, Web Animations API)
 *   - Canvas / WebGL rendering
 *   - Unit tests asserting color values
 *   - Dynamic style generation in lib functions
 *
 * These values MUST stay in sync with tokens.css.
 * The canonical source of truth is always the CSS file.
 */

/* ============================================================
   BRAND COLORS (raw hex)
   ============================================================ */
export const colors = {
  // Primary brand
  copper:      '#B87333',
  copperLight: '#D4956A',
  copperDark:  '#8B5629',

  // Secondary
  gold:      '#D4A843',
  goldLight: '#E5C675',

  // Neutral bases
  warmWhite: '#FDF8F3',
  charcoal:  '#2C2421',

  // Dark surfaces
  surfaceDark:  '#1A1614',
  surfaceLight: '#FFFFFF',

  // Mode accents
  sage:  '#7A9E7E',
  ember: '#C85A3A',

  // Text — dark theme
  textPrimaryDark: '#F5EDE6',
  textMutedDark:   '#9B8E85',

  // Text — light theme
  textPrimaryLight: '#2C2421',
  textMutedLight:   '#7A6E66',
} as const

/* ============================================================
   BRAND COLORS (HSL components)
   Match the --color-*-h/s/l pattern from tokens.css
   for use with hsl() in JS contexts.
   ============================================================ */
export const colorHSL = {
  copper:      { h: 28,  s: '52%', l: '46%' },
  copperLight: { h: 26,  s: '55%', l: '63%' },
  copperDark:  { h: 27,  s: '55%', l: '35%' },
  gold:        { h: 42,  s: '57%', l: '56%' },
  goldLight:   { h: 42,  s: '66%', l: '68%' },
  warmWhite:   { h: 30,  s: '71%', l: '97%' },
  charcoal:    { h: 13,  s: '15%', l: '15%' },
  surfaceDark: { h: 15,  s: '12%', l:  '9%' },
  sage:        { h: 130, s: '16%', l: '55%' },
  ember:       { h: 14,  s: '58%', l: '50%' },
} as const

/* ============================================================
   SPACING SCALE (px values as numbers)
   ============================================================ */
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 96,
} as const

/* ============================================================
   BORDER RADIUS (px values as numbers)
   ============================================================ */
export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const

/* ============================================================
   Z-INDEX SCALE
   ============================================================ */
export const zIndex = {
  base:     0,
  dropdown: 100,
  sticky:   200,
  modal:    300,
  toast:    400,
  tooltip:  500,
} as const

/* ============================================================
   ANIMATION DURATIONS (ms)
   ============================================================ */
export const duration = {
  spring:     500,
  springSoft: 600,
  exit:       200,
} as const

/* ============================================================
   FONT FAMILIES (CSS variable references)
   ============================================================ */
export const fonts = {
  display: 'var(--font-display)',
  body:    'var(--font-body)',
  mono:    'var(--font-mono)',
} as const

/* ============================================================
   CSS VARIABLE NAMES
   Reference these strings when reading/writing CSS variables
   programmatically (e.g. element.style.setProperty).
   ============================================================ */
export const cssVars = {
  colorCopper:        '--color-copper',
  colorGold:          '--color-gold',
  colorAccent:        '--color-accent',
  colorBgPrimary:     '--color-bg-primary',
  colorBgElevated:    '--color-bg-elevated',
  colorTextPrimary:   '--color-text-primary',
  colorTextMuted:     '--color-text-muted',
  colorBorder:        '--color-border',
  accentH:            '--accent-h',
  accentS:            '--accent-s',
  accentL:            '--accent-l',
  springDuration:     '--spring-duration',
  springSoftDuration: '--spring-soft-duration',
} as const

/* ============================================================
   TYPE HELPERS
   ============================================================ */
export type ColorName    = keyof typeof colors
export type SpacingName  = keyof typeof spacing
export type RadiusName   = keyof typeof radius
export type ZIndexLevel  = keyof typeof zIndex
