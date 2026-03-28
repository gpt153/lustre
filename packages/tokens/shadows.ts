/**
 * Lustre Cross-Platform Shadow Tokens
 *
 * Ultra-diffused shadow system — max 0.06 opacity, warm charcoal base.
 *
 * Each shadow object contains both iOS (shadowColor/shadowOffset/
 * shadowOpacity/shadowRadius) and Android (elevation) properties so they
 * can be spread directly into StyleSheet.create.
 *
 * Pure TypeScript constants — no runtime, no provider.
 */

const SHADOW_COLOR = '#2C2421' // charcoal — warm-tinted dark base

export const SHADOWS = {
  /**
   * Subtle lift — cards at rest, input fields
   * Ultra-diffused: 0.04 opacity
   */
  sm: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  /**
   * Medium lift — cards on hover, modals, dropdowns
   * Ultra-diffused: 0.06 opacity
   */
  md: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },

  /**
   * Strong lift — bottom sheets, floating action buttons
   * Ultra-diffused: 0.06 opacity
   */
  lg: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
  },

  /**
   * Deep lift — full-screen overlays, navigation headers
   * Ultra-diffused: 0.06 opacity
   */
  xl: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 6,
  },
} as const

export type ShadowKey = keyof typeof SHADOWS
export type ShadowToken = (typeof SHADOWS)[ShadowKey]
