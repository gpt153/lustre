'use client'

import { useState, useEffect } from 'react'

export type Breakpoint = 'xl' | 'lg' | 'md' | 'sm' | 'xs'

interface BreakpointState {
  breakpoint: Breakpoint
  isDesktop: boolean
  isMobile: boolean
}

/*
 * Breakpoint thresholds — match AppShell.module.css media queries.
 *
 * xl  : >= 1440px  — Full three-zone layout
 * lg  : 1200–1439px — Context panel 280px
 * md  : 900–1199px — NavRail + Main, no context panel
 * sm  : 600–899px  — Single column, BottomNav, no NavRail
 * xs  : < 600px    — Compact layout
 */
const BREAKPOINTS = {
  xl: '(min-width: 1440px)',
  lg: '(min-width: 1200px) and (max-width: 1439px)',
  md: '(min-width: 900px) and (max-width: 1199px)',
  sm: '(min-width: 600px) and (max-width: 899px)',
  xs: '(max-width: 599px)',
} as const satisfies Record<Breakpoint, string>

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'xl'

  if (window.matchMedia('(min-width: 1440px)').matches)       return 'xl'
  if (window.matchMedia('(min-width: 1200px)').matches)       return 'lg'
  if (window.matchMedia('(min-width: 900px)').matches)        return 'md'
  if (window.matchMedia('(min-width: 600px)').matches)        return 'sm'
  return 'xs'
}

/**
 * useBreakpoint — Returns the current responsive breakpoint.
 *
 * Uses matchMedia listeners for zero-polling change detection.
 * SSR-safe: defaults to 'xl' on server, resolves on mount.
 *
 * @returns {BreakpointState}
 *   - breakpoint: 'xl' | 'lg' | 'md' | 'sm' | 'xs'
 *   - isDesktop:  true when >= 900px (NavRail visible)
 *   - isMobile:   true when < 900px  (BottomNav visible)
 */
export function useBreakpoint(): BreakpointState {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xl')

  useEffect(() => {
    // Set the correct breakpoint on mount (avoids SSR mismatch)
    setBreakpoint(getBreakpoint())

    // Create a MediaQueryList for each breakpoint and listen for changes
    const queries = Object.entries(BREAKPOINTS).map(([bp, query]) => {
      const mql = window.matchMedia(query)

      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          setBreakpoint(bp as Breakpoint)
        }
      }

      mql.addEventListener('change', handler)

      return { mql, handler }
    })

    return () => {
      queries.forEach(({ mql, handler }) => {
        mql.removeEventListener('change', handler)
      })
    }
  }, [])

  return {
    breakpoint,
    isDesktop: breakpoint === 'xl' || breakpoint === 'lg' || breakpoint === 'md',
    isMobile:  breakpoint === 'sm' || breakpoint === 'xs',
  }
}
