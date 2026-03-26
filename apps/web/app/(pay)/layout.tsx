'use client'

import { Providers } from '../(app)/providers'
import { AuthGuard } from '../(app)/auth-guard'
import Link from 'next/link'

function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: '#E91E63',
        color: '#fff',
      }}
    >
      <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 24, fontWeight: 700 }}>
        Lustre
      </Link>
    </header>
  )
}

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthGuard>
        <Header />
        <main>{children}</main>
      </AuthGuard>
    </Providers>
  )
}
