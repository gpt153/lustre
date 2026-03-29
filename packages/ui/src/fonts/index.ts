import { createFont } from '@tamagui/core'

/**
 * Noto Serif font — used for all headings (display, headline)
 *
 * Size scale:
 *   1=12  2=14  3=16  4=18  5=24  6=28  7=32  8=40  9=56
 *
 * Typography tokens:
 *   display-lg  → size 9  (56px) NotoSerif Bold,  letterSpacing -1.12
 *   display-md  → size 8  (40px) NotoSerif Bold
 *   headline-lg → size 7  (32px) NotoSerif Bold
 *   headline-md → size 6  (28px) NotoSerif Regular
 *   headline-sm → size 5  (24px) NotoSerif Regular
 */
export const notoSerifFont = createFont({
  family: 'NotoSerif_400Regular',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 24,
    6: 28,
    7: 32,
    8: 40,
    9: 56,
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 22,
    4: 24,
    5: 32,
    6: 36,
    7: 40,
    8: 48,
    9: 64,
  },
  weight: {
    4: '400',
    7: '700',
  },
  letterSpacing: {
    // display-lg tight letter-spacing: -0.02em × 56px = -1.12
    9: -1.12,
  },
  face: {
    400: { normal: 'NotoSerif_400Regular', italic: 'NotoSerif_400Regular_Italic' },
    700: { normal: 'NotoSerif_700Bold' },
  },
})

/**
 * Manrope font — used for all body text, labels
 *
 * Size scale:
 *   1=12  2=14  3=16  4=18  5=20
 *
 * Typography tokens:
 *   body-lg   → size 4 (18px) Manrope Medium   (weight 500)
 *   body-md   → size 3 (16px) Manrope Regular  (weight 400)
 *   body-sm   → size 2 (14px) Manrope Regular  (weight 400)
 *   label-lg  → size 2 (14px) Manrope SemiBold (weight 600)
 *   label-md  → size 1 (12px) Manrope Medium   (weight 500)
 */
export const manropeFont = createFont({
  family: 'Manrope_400Regular',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 24,
    4: 26,
    5: 28,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
    7: '700',
  },
  face: {
    400: { normal: 'Manrope_400Regular' },
    500: { normal: 'Manrope_500Medium' },
    600: { normal: 'Manrope_600SemiBold' },
    700: { normal: 'Manrope_700Bold' },
  },
})

/**
 * Caveat handwritten font — used for Polaroid captions and handwritten notes
 *
 * Size scale:
 *   1=12  2=14  3=16  4=18  5=20  6=24  7=30
 */
export const handwrittenFont = createFont({
  family: 'Caveat_400Regular',
  size: { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 30 },
  lineHeight: { 1: 16, 2: 18, 3: 20, 4: 22, 5: 24, 6: 28, 7: 36 },
  weight: { 4: '400', 7: '700' },
  letterSpacing: { 4: 0 },
  face: {
    400: { normal: 'Caveat_400Regular' },
    700: { normal: 'Caveat_700Bold' },
  },
})

// Backwards-compatible aliases (kept so existing $heading/$body refs continue to work)
export const generalSansFont = notoSerifFont
export const interFont = manropeFont
