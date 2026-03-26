import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { tokens as defaultTokens } from '@tamagui/themes'
import { lustreThemes } from './themes'
import { lustreColorTokens, lustreShadowTokens } from './tokens'
import { generalSansFont, interFont } from './fonts'

const headingFont = generalSansFont
const bodyFont = interFont

const tokens = {
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    ...lustreColorTokens,
  },
  shadows: {
    ...defaultTokens.shadows,
    ...lustreShadowTokens,
  },
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
