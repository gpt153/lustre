'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores'
import styles from './AuthGuard.module.css'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * AuthGuard — Wraps the authenticated (app) layout.
 *
 * Hydrates the Zustand auth store on mount (skipHydration is set),
 * then redirects to /login when unauthenticated.
 *
 * Three states:
 *   1. Hydrating   — full-screen skeleton with shimmer
 *   2. Authed      — renders children
 *   3. Not authed  — redirects to /login (renders nothing while navigating)
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    // Trigger Zustand persist rehydration — needed because skipHydration: true
    // Register callback before calling rehydrate to catch sync completions
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    useAuthStore.persist.rehydrate()
    // If rehydrate completed synchronously, hasHydrated is already true
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    }
    return unsub
  }, [])

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login')
    }
  }, [hydrated, isAuthenticated, router])

  // Still hydrating — show skeleton
  if (!hydrated) {
    return <AuthSkeleton />
  }

  // Hydrated but not authenticated — redirect in progress, render nothing
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// ──────────────────────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────────────────────

function AuthSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true" aria-label="Laddar...">
      {/* NavRail skeleton */}
      <div className={styles.skeletonNav}>
        <div className={styles.skeletonNavLogo} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonNavItem} />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className={styles.skeletonMain}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonContent}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    </div>
  )
}
