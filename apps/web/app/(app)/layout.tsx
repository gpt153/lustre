import { AppShell } from '@/components/layout/AppShell'

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * AppLayout — Root layout for all authenticated routes.
 *
 * Wraps every route inside (app)/ with the AppShell three-zone grid.
 * This is a Server Component — AppShell is 'use client' and handles
 * all interactive breakpoint behaviour internally.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>
}
