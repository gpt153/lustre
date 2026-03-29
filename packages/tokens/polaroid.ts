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
