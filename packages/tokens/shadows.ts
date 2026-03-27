/**
 * Lustre Cross-Platform Shadow Tokens
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
   */
  sm: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  /**
   * Medium lift — cards on hover, modals, dropdowns
   */
  md: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },

  /**
   * Strong lift — bottom sheets, floating action buttons
   */
  lg: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  /**
   * Deep lift — full-screen overlays, navigation headers
   */
  xl: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 12,
  },
} as const

export type ShadowKey = keyof typeof SHADOWS
export type ShadowToken = (typeof SHADOWS)[ShadowKey]
