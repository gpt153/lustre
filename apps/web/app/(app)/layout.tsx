import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/layout/AuthGuard'

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * AppLayout — Root layout for all authenticated routes.
 *
 * AuthGuard hydrates the auth store and redirects to /login when the
 * user is not authenticated. AppShell renders the three-zone grid.
 *
 * This is a Server Component — both AuthGuard and AppShell are
 * 'use client' and handle interactivity internally.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
