'use client'

import { Providers } from './providers'
import { AuthGuard } from './auth-guard'
import { Header } from './components/Header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthGuard>
        <Header />
        <main style={{ backgroundColor: '#FDF8F3', minHeight: '100vh' }}>{children}</main>
      </AuthGuard>
    </Providers>
  )
}
