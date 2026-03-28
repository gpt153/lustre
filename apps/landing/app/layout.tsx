import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Lustre — Dejting designat för dig som förtjänar bättre',
  description: 'Sveriges första moderna plattform för vuxna som vill mer. Intelligent filtrering, verifierade användare, inbyggd trygghet. Få tidig tillgång.',
  metadataBase: new URL('https://lovelustre.com'),
  openGraph: {
    title: 'Lustre — Dejting designat för dig som förtjänar bättre',
    description: 'Sveriges första moderna plattform för vuxna som vill mer. Intelligent filtrering, verifierade användare, inbyggd trygghet.',
    type: 'website',
    locale: 'sv_SE',
    siteName: 'Lustre',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lustre — Dejting designat för dig som förtjänar bättre',
    description: 'Sveriges första moderna plattform för vuxna som vill mer.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#08080D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={inter.variable}>
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
