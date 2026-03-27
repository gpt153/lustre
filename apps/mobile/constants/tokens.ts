/**
 * Mobile token re-exports
 *
 * Provides a single convenient import path for all design tokens
 * within the mobile app:
 *
 *   import { SPACING, COLORS, SHADOWS } from '@/constants/tokens'
 */

export {
  SPACING,
  COLORS,
  COLORS_VANILLA_LIGHT,
  COLORS_VANILLA_DARK,
  COLORS_SPICY_LIGHT,
  COLORS_SPICY_DARK,
  SHADOWS,
} from '@lustre/tokens'

export type {
  SpacingKey,
  SpacingValue,
  ColorKey,
  ColorValue,
  ModeColorSet,
  ShadowKey,
  ShadowToken,
} from '@lustre/tokens'
