import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lustre',
  description: 'Dejting designat för dig som förtjänar bättre.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
