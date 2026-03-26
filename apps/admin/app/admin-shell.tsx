'use client'

import { usePathname } from 'next/navigation'

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <main style={{
        flex: 1,
        marginLeft: isLoginPage ? 0 : '240px',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
      }}>
        {children}
      </main>
    </div>
  )
}
