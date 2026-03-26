/**
 * Next.js font loaders for Lustre typography
 *
 * Usage in apps/web/app/layout.tsx:
 * - Import generalSansFontStyles and interFontStyles
 * - Add them to the <style> tag in RootLayout
 * - Use the font families in your components
 */

// For local font files via next/font/local
import localFont from 'next/font/local'

/**
 * General Sans variable font loader
 * Uses @fontsource-variable/general-sans
 */
export const generalSansFont = localFont({
  src: [
    {
      path: '../../../node_modules/@fontsource-variable/general-sans/files/general-sans-latin-wght.ttf',
      weight: '100 900',
      style: 'normal',
      variable: '--font-general-sans',
    },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-general-sans',
})

/**
 * Inter font loader via Google Fonts
 * Preloaded with display: 'swap' for better performance
 */
import { Inter } from 'next/font/google'

export const interFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  weight: ['400', '500', '600'],
})

/**
 * Combined font class names for use in html tag
 * Usage in RootLayout:
 * <html className={`${generalSansFont.variable} ${interFont.variable}`}>
 */
export const fontVariables = `${generalSansFont.variable} ${interFont.variable}`
