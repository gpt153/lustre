/**
 * Polaroid 600 Design Tokens
 *
 * Exact proportions from a real Polaroid 600 instant photo card.
 * Pure TypeScript constants — no runtime, no provider.
 */

import { SHADOWS } from './shadows'

export const POLAROID = {
  /** Card aspect ratio: 88mm wide × 107mm tall */
  CARD_ASPECT: 88 / 107,
  /** Image area aspect ratio: 79mm wide × 77mm tall (near-square) */
  IMAGE_ASPECT: 79 / 77,
  /** Side border as fraction of card width: ~5.11% */
  BORDER_SIDE: 0.0511,
  /** Top border as fraction of card height: ~7.39% */
  BORDER_TOP: 0.0739,
  /** Bottom border as fraction of card height: ~26.70% */
  BORDER_BOTTOM: 0.2670,
  /** Image width as fraction of card width: ~89.77% */
  IMAGE_WIDTH_RATIO: 0.8977,
} as const

export const POLAROID_ROTATIONS = [-5, -3, -1.5, 0, 1.5, 3, 5] as const

export const POLAROID_SHADOW = SHADOWS.md

export interface PolaroidDimensions {
  cardWidth: number
  cardHeight: number
  imageWidth: number
  imageHeight: number
  borderSide: number
  borderTop: number
  borderBottom: number
}

export const POLAROID_COLORS = {
  primary: '#894d0d',
  primaryContainer: '#a76526',
  primaryFixed: '#ffdcc2',
  primaryFixedDim: '#ffb77b',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#fffbff',
  onPrimaryFixed: '#2e1500',
  onPrimaryFixedVariant: '#6d3a00',
  secondary: '#795900',
  secondaryContainer: '#fece65',
  secondaryFixed: '#ffdf9f',
  secondaryFixedDim: '#eec058',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#755700',
  onSecondaryFixed: '#261a00',
  onSecondaryFixedVariant: '#5b4300',
  tertiary: '#9f3c1e',
  tertiaryContainer: '#bf5334',
  tertiaryFixed: '#ffdbd1',
  tertiaryFixedDim: '#ffb5a0',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#fffbff',
  onTertiaryFixed: '#3b0900',
  onTertiaryFixedVariant: '#82270b',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#fff1ec',
  surface: '#fff8f6',
  surfaceContainer: '#faebe6',
  surfaceContainerHigh: '#f4e5e0',
  surfaceContainerHighest: '#eedfda',
  surfaceBright: '#fff8f6',
  surfaceDim: '#e6d7d2',
  surfaceVariant: '#eedfda',
  surfaceTint: '#8c4f10',
  onSurface: '#211a17',
  onSurfaceVariant: '#524439',
  onBackground: '#211a17',
  outline: '#857467',
  outlineVariant: '#d8c3b4',
  inverseSurface: '#372f2b',
  inverseOnSurface: '#fdeee8',
  inversePrimary: '#ffb77b',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',
  copper: '#B87333',
  gold: '#D4A843',
  warmCream: '#FDF8F3',
  charcoal: '#2C2421',
} as const

export const POLAROID_CARD_SHADOWS = {
  card: { shadowColor: '#2E1500', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 4 },
  cardLift: { shadowColor: '#2E1500', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 32, elevation: 6 },
  avatar: { shadowColor: '#2E1500', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 3 },
  appBar: { shadowColor: '#211A17', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 40, elevation: 2 },
  bottomNav: { shadowColor: '#211A17', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.05, shadowRadius: 30, elevation: 2 },
} as const

export const POLAROID_GRADIENTS = {
  copper: { colors: ['#894D0D', '#A76526'] as const, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  tonal: { colors: ['rgba(184,115,51,0.08)', 'rgba(253,248,243,1)'] as const, start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
} as const

export const POLAROID_TYPOGRAPHY = {
  families: {
    headline: 'Epilogue',
    headlineAlt: 'PlusJakartaSans',
    body: 'Inter',
    bodyAlt: 'PlusJakartaSans',
    label: 'Inter',
    labelAlt: 'BeVietnamPro',
    handwritten: 'Caveat_400Regular',
    handwrittenBold: 'Caveat_700Bold',
  },
} as const

export function getPolaroidDimensions(cardWidth: number): PolaroidDimensions {
  const cardHeight = cardWidth / POLAROID.CARD_ASPECT
  const imageWidth = cardWidth * POLAROID.IMAGE_WIDTH_RATIO
  const imageHeight = imageWidth / POLAROID.IMAGE_ASPECT
  const borderSide = cardWidth * POLAROID.BORDER_SIDE
  const borderTop = cardHeight * POLAROID.BORDER_TOP
  const borderBottom = cardHeight * POLAROID.BORDER_BOTTOM

  return {
    cardWidth,
    cardHeight,
    imageWidth,
    imageHeight,
    borderSide,
    borderTop,
    borderBottom,
  }
}
