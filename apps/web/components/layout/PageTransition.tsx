'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import styles from './PageTransition.module.css'

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * PageTransition
 *
 * Wraps page content to provide enter/exit animations using the View
 * Transitions API when available (enabled via next.config.ts
 * `experimental.viewTransition: true`). Falls back to a CSS opacity
 * crossfade for browsers without support.
 *
 * View transition names allow individual elements to be targeted with
 * ::view-transition-old / ::view-transition-new pseudo-elements in CSS.
 * See PageTransition.module.css for the keyframe definitions.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const prevPathRef = useRef<string | null>(pathname)

  useEffect(() => {
    if (prevPathRef.current === pathname) return
    prevPathRef.current = pathname

    const el = containerRef.current
    if (!el) return

    // Trigger re-entry animation on route change
    el.classList.remove(styles.entered)
    // Force reflow to restart animation
    void el.offsetHeight
    el.classList.add(styles.entered)
  }, [pathname])

  return (
    <div
      ref={containerRef}
      className={`${styles.pageTransition} ${styles.entered}`}
      style={{ viewTransitionName: 'page' }}
    >
      {children}
    </div>
  )
}
