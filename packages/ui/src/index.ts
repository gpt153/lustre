export { config, default as tamaguiConfig } from './tamagui.config'
export type { AppConfig } from './tamagui.config'
export { lustreColorTokens, lustreShadowTokens, lustreTokens } from './tokens'
export type { LustreColorTokens, LustreShadowTokens, LustreTokens } from './tokens'
export { lustreThemes } from './themes'
export type { LustreTheme } from './themes'
export { LustreButton } from './LustreButton'
export { LustreInput } from './LustreInput'
export { LogoBrand } from './LogoBrand'
export { LustreLogo } from './LustreLogo'
export type { LustreLogoProps } from './LustreLogo'
export { CardBase } from './CardBase'
export { ModalBase } from './ModalBase'
export { BottomSheetBase } from './BottomSheetBase'
export { KudosBadgeTag } from './KudosBadgeTag'

// Font exports
export { generalSansFont, interFont } from './fonts'
// Note: expo-font loaders must be imported directly from '@lustre/ui/src/fonts/expo-loader'
// in the Expo app — they cannot be re-exported here as it breaks the Next.js web build.
// Similarly, next/font loaders must be used directly in apps/web/app/layout.tsx.
