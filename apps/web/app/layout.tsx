import type { Metadata } from 'next'
import { Providers } from './providers'
import { AuthGuard } from './auth-guard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lustre',
  description: 'A sex-positive social network',
}

function Header() {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      backgroundColor: '#E91E63',
      color: '#fff',
    }}>
      <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 24, fontWeight: 700 }}>
        Lustre
      </Link>
      <nav style={{ display: 'flex', gap: 24 }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
        <Link href="/discover" style={{ color: '#fff', textDecoration: 'none' }}>Discover</Link>
        <Link href="/chat" style={{ color: '#fff', textDecoration: 'none' }}>Chat</Link>
        <Link href="/profile" style={{ color: '#fff', textDecoration: 'none' }}>Profile</Link>
      </nav>
    </header>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Providers>
          <AuthGuard>
            <Header />
            <main>{children}</main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
