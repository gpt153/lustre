'use client'

import { useAuth } from '@lustre/app'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsPayment, needsDisplayName } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
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
  }, [isAuthenticated, needsPayment, needsDisplayName, pathname, router])

  return <>{children}</>
}
