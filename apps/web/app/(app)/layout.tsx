'use client'

import { Providers } from './providers'
import { AuthGuard } from './auth-guard'
import Link from 'next/link'

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
        <Link href="/discover" style={{ color: '#fff', textDecoration: 'none' }}>Discover</Link>
        <Link href="/groups" style={{ color: '#fff', textDecoration: 'none' }}>Groups</Link>
        <Link href="/events" style={{ color: '#fff', textDecoration: 'none' }}>Events</Link>
        <Link href="/orgs" style={{ color: '#fff', textDecoration: 'none' }}>Orgs</Link>
        <Link href="/shop" style={{ color: '#fff', textDecoration: 'none' }}>Shop</Link>
        <Link href="/chat" style={{ color: '#fff', textDecoration: 'none' }}>Chat</Link>
        <Link href="/coach" style={{ color: '#fff', textDecoration: 'none' }}>Coach</Link>
        <Link href="/profile" style={{ color: '#fff', textDecoration: 'none' }}>Profile</Link>
      </nav>
    </header>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthGuard>
        <Header />
        <main>{children}</main>
      </AuthGuard>
    </Providers>
  )
}
