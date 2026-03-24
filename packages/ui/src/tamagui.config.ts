import { createTamagui } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens as defaultTokens } from '@tamagui/themes'

const headingFont = createInterFont({
  size: { 1: 12, 2: 14, 3: 16, 4: 20, 5: 24, 6: 32, 7: 40, 8: 48 },
  weight: { 4: '400', 6: '600', 7: '700' },
})

const bodyFont = createInterFont({
  size: { 1: 12, 2: 14, 3: 16, 4: 18 },
  weight: { 4: '400', 5: '500', 6: '600' },
})

const lustreTokens = {
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    primary: '#E91E63',
    primaryDark: '#C2185B',
    primaryLight: '#F48FB1',
    secondary: '#7C4DFF',
    secondaryDark: '#651FFF',
    secondaryLight: '#B388FF',
    background: '#FFFFFF',
    backgroundDark: '#121212',
    surface: '#F5F5F5',
    surfaceDark: '#1E1E1E',
    text: '#212121',
    textDark: '#FAFAFA',
    textSecondary: '#757575',
    textSecondaryDark: '#BDBDBD',
  },
}

export const config = createTamagui({
  defaultFont: 'body',
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes,
  tokens: lustreTokens,
  shorthands,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
})

export default config

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
