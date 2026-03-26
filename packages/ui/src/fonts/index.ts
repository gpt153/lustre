import { createFont } from '@tamagui/core'
import { createInterFont } from '@tamagui/font-inter'

/**
 * General Sans font definition for Lustre
 * Using Fontshare/Fontsource variable font fallback
 * Actual font loading is handled by:
 * - Expo: expo-font with @fontsource-variable/general-sans
 * - Web: next/font/local or CSS import
 */
export const generalSansFont = createFont({
  family: 'General Sans',
  size: {
    1: 14,
    2: 16,
    3: 18,
    4: 20,
    5: 24,
    6: 28,
    7: 32,
    8: 40,
  },
  lineHeight: {
    1: 1.3,
    2: 1.3,
    3: 1.3,
    4: 1.3,
    5: 1.3,
    6: 1.3,
    7: 1.3,
    8: 1.3,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
    4: '700',
  },
  letterSpacing: {
    1: 0,
    2: 0,
  },
  // $brand variant for Lustre logo text
  $brand: {
    weight: '600',
    size: 5, // 24px
    letterSpacing: 2,
    lineHeight: 1.3,
  },
})

/**
 * Inter font definition for body text
 * Using Tamagui's built-in createInterFont
 */

export const interFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
  },
  lineHeight: {
    1: 1.5,
    2: 1.5,
    3: 1.5,
    4: 1.5,
    5: 1.5,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
  },
})
