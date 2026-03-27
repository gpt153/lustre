/**
 * Lustre Semantic Spacing Scale
 *
 * Pure TypeScript constants — no runtime, no provider.
 * Inlined by Hermes bytecode compiler.
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export type SpacingKey = keyof typeof SPACING
export type SpacingValue = (typeof SPACING)[SpacingKey]
