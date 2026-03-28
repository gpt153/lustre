import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { tokens as defaultTokens } from '@tamagui/themes'
import { lustreThemes } from './themes'
import {
  lustreColorTokens,
  lustreShadowTokens,
  lustreRoundnessTokens,
} from './tokens'
import { notoSerifFont, manropeFont } from './fonts'

const headingFont = notoSerifFont
const bodyFont = manropeFont

const tokens = {
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    ...lustreColorTokens,
  },
  space: {
    ...defaultTokens.space,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  size: {
    ...defaultTokens.size,
  },
  radius: {
    ...defaultTokens.radius,
    sm: lustreRoundnessTokens.sm,
    md: lustreRoundnessTokens.md,
    lg: lustreRoundnessTokens.lg,
    xl: lustreRoundnessTokens.xl,
    full: lustreRoundnessTokens.full,
  },
  ...((defaultTokens as any).shadows ? { shadows: { ...(defaultTokens as any).shadows, ...lustreShadowTokens } } : {}),
}

export const config = createTamagui({
  defaultFont: 'body',
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes: lustreThemes,
  tokens,
  shorthands,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
})

export default config

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
