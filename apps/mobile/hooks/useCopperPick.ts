/**
 * useCopperPick
 *
 * Data hook for the daily Copper Pick recommendation.
 *
 * Strategy:
 *   - Returns the first profile from the discovery stack as the "Copper Pick"
 *   - Tracks dismissals in module-level state keyed by calendar date (YYYY-MM-DD)
 *   - Once dismissed for the day, hasCopperPick returns false until the next day
 *
 * When a real tRPC endpoint (trpc.match.getCopperPick) is available, replace
 * the mock derivation while keeping the same public interface.
 */

import { useCallback, useMemo, useRef } from 'react'
import { useDiscovery } from '@lustre/app'
import type { ProfileCardStoryProfile } from '@/components/ProfileCardStory'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Module-level dismissal store — persists for the lifetime of the JS bundle
// (i.e. the current app session). A real implementation would use AsyncStorage.
const dismissedDays = new Set<string>()

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface CopperPickProfile extends ProfileCardStoryProfile {
  /** Hardcoded "why you match" blurb shown on the Copper Pick card. */
  whyYouMatch: string
}

export interface UseCopperPickResult {
  /** True when a Copper Pick is available and has not been dismissed today. */
  hasCopperPick: boolean
  /** The profile to display, or null when none is available. */
  copperPickProfile: CopperPickProfile | null
  /** Call when the user likes, passes, or otherwise dismisses the Copper Pick. */
  dismissCopperPick: () => void
  /** True while the discovery stack is loading. */
  isLoading: boolean
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCopperPick(): UseCopperPickResult {
  const { profiles, isLoading } = useDiscovery()

  // Stable ref to the dismissed-today flag so dismissCopperPick callback is
  // referentially stable across renders.
  const isDismissedTodayRef = useRef(dismissedDays.has(todayKey()))

  const copperPickProfile = useMemo<CopperPickProfile | null>(() => {
    if (isDismissedTodayRef.current) return null
    if (!profiles || profiles.length === 0) return null

    const first = profiles[0]
    return {
      userId: first.userId ?? first.id ?? '',
      displayName: first.displayName ?? '',
      age: first.age ?? 0,
      photos: (first.photos ?? []).map((p) => ({
        url: p.url,
        thumbnailLarge: p.thumbnailLarge ?? undefined,
        thumbnailMedium: p.thumbnailMedium ?? undefined,
      })),
      prompts: [],
      whyYouMatch: 'Ni delar intresse för konst och kultur',
    }
  }, [profiles])

  const hasCopperPick =
    !isLoading &&
    !isDismissedTodayRef.current &&
    copperPickProfile !== null &&
    (copperPickProfile.photos?.length ?? 0) > 0

  const dismissCopperPick = useCallback(() => {
    const key = todayKey()
    dismissedDays.add(key)
    isDismissedTodayRef.current = true
  }, [])

  return {
    hasCopperPick,
    copperPickProfile,
    dismissCopperPick,
    isLoading,
  }
}
