import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { AdminSidebar } from './admin-sidebar'
import { AdminShell } from './admin-shell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lustre Admin',
  description: 'Lustre internal admin dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          fontFamily: inter.style.fontFamily,
        }}
      >
        <Providers>
          <AdminSidebar />
          <AdminShell>
            {children}
          </AdminShell>
        </Providers>
      </body>
    </html>
  )
}
