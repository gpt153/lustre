import type { Metadata } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
import { Inter } from 'next/font/google'

const generalSans = localFont({
  src: '../../../node_modules/@fontsource-variable/general-sans/files/general-sans-latin-wght-normal.woff2',
  display: 'swap',
  preload: true,
  variable: '--font-general-sans',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Lustre',
  description: 'Dejting designat för dig som förtjänar bättre.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" suppressHydrationWarning className={`${generalSans.variable} ${inter.variable}`}>
      <body style={{ margin: 0, fontFamily: 'var(--font-inter, system-ui)' }}>
        {children}
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
