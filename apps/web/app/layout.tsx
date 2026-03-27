import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import '@/styles/globals.css'

/*
 * Inter — body text, UI labels
 * Loaded from Google Fonts via next/font (zero layout shift, self-hosted by Next.js)
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

/*
 * JetBrains Mono — tags, kink tags, metadata, timestamps
 * Loaded from Google Fonts via next/font
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false, // Not critical — defer to save bandwidth
  weight: ['400', '500'],
})

/*
 * General Sans — display / hero text
 *
 * General Sans is not available on Google Fonts. Place font files in
 * public/fonts/general-sans/ (woff2 format) and uncomment the localFont
 * block below. Until files are present, the --font-display token in
 * tokens.css falls back gracefully to system-ui / sans-serif.
 *
 * To add the font:
 *   1. Download from fonts.fontshare.com/fonts/general-sans
 *   2. Place files at apps/web/public/fonts/general-sans/
 *   3. Uncomment the block below and remove the stub
 *
 * import localFont from 'next/font/local'
 *
 * const generalSans = localFont({
 *   src: [
 *     { path: '../public/fonts/general-sans/GeneralSans-Regular.woff2',    weight: '400', style: 'normal' },
 *     { path: '../public/fonts/general-sans/GeneralSans-Medium.woff2',     weight: '500', style: 'normal' },
 *     { path: '../public/fonts/general-sans/GeneralSans-Semibold.woff2',   weight: '600', style: 'normal' },
 *     { path: '../public/fonts/general-sans/GeneralSans-Bold.woff2',       weight: '700', style: 'normal' },
 *   ],
 *   variable: '--font-general-sans',
 *   display: 'swap',
 *   preload: true,
 * })
 */

export const metadata: Metadata = {
  title: 'Lustre',
  description: 'En sex-positiv dejting- och socialplattform för dig som vet vad du vill.',
  applicationName: 'Lustre',
  metadataBase: new URL('https://lovelustre.com'),
  openGraph: {
    siteName: 'Lustre',
    locale: 'sv_SE',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png',    type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/icon-192.png', sizes: '192x192' },
      { rel: 'icon', url: '/icon-512.png', sizes: '512x512' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2C2421',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const umamiUrl       = process.env.NEXT_PUBLIC_UMAMI_URL
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  return (
    <html
      lang="sv"
      data-theme="dark"
      data-mode="vanilla"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to image CDN for faster asset loading */}
        <link rel="preconnect" href="https://upload.wikimedia.org" />

        {/* Umami analytics — self-hosted, privacy-respecting, GDPR compliant */}
        {umamiUrl && umamiWebsiteId && (
          <script
            defer
            src={`${umamiUrl}/script.js`}
            data-website-id={umamiWebsiteId}
          />
        )}
      </head>
      <body>
        {/* Skip navigation for keyboard users */}
        <a href="#main-content" className="skip-to-content">
          Hoppa till innehållet
        </a>

        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
