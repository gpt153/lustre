'use client'

import { useAuth } from '@lustre/app'
import { useAuthStore } from '@lustre/app'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsPayment, needsDisplayName } = useAuth()
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect until the auth store has hydrated from localStorage
    if (!hasHydrated) return

    // Don't redirect on auth pages
    if (pathname.startsWith('/auth')) return

    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    // Redirect to payment if needed
    if (needsPayment) {
      router.push('/auth/payment')
      return
    }

    // Redirect to display name setup if needed
    if (needsDisplayName) {
      router.push('/auth/display-name')
      return
    }
  }, [hasHydrated, isAuthenticated, needsPayment, needsDisplayName, pathname, router])

  return <>{children}</>
}
