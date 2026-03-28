'use client'

import { useState, useCallback } from 'react'
import FilterSidebar from '@/components/discover/FilterSidebar'
import ProfileCard from '@/components/discover/ProfileCard'
import DiscoverSkeleton from '@/components/discover/DiscoverSkeleton'
import EmptyState from '@/components/common/EmptyState'
import { useDiscoverKeyboard } from '@/hooks/useDiscoverKeyboard'
import { api } from '@/lib/trpc'
import type { DiscoverFilters } from '@/components/discover/FilterSidebar'
import type { DiscoverProfile } from '@/components/discover/ProfileCard'
import styles from './page.module.css'

export default function SearchPage() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleApplyFilters = useCallback(async (filters: DiscoverFilters) => {
    setIsSearching(true)
    setHasSearched(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (api as any).match.search.query({
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        distanceKm: filters.distanceKm,
        genders: filters.genders.length > 0 ? filters.genders : undefined,
        orientations: filters.orientations.length > 0 ? filters.orientations : undefined,
        seeking: filters.seeking.length > 0 ? filters.seeking : undefined,
      })
      const raw = Array.isArray(result) ? result : []
      // API returns photo objects { id, url, ... } — map to string[]
      setProfiles(
        raw.map((p: Record<string, unknown>) => ({
          ...p,
          photos: Array.isArray(p.photos)
            ? p.photos.map((ph: unknown) =>
                typeof ph === 'string' ? ph : (ph as { url: string }).url
              )
            : [],
        })) as DiscoverProfile[]
      )
    } catch {
      setProfiles([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleLike = useCallback((id: string) => {
    console.log('[Search] Like:', id)
  }, [])

  const handlePass = useCallback((id: string) => {
    console.log('[Search] Pass:', id)
  }, [])

  const handleLikeByIndex = useCallback(
    (index: number) => {
      const profile = profiles[index]
      if (profile) handleLike(profile.id)
    },
    [profiles, handleLike]
  )

  const handlePassByIndex = useCallback(
    (index: number) => {
      const profile = profiles[index]
      if (profile) handlePass(profile.id)
    },
    [profiles, handlePass]
  )

  const { focusedIndex } = useDiscoverKeyboard({
    totalCards: profiles.length,
    columns: 3,
    onLike: handleLikeByIndex,
    onPass: handlePassByIndex,
  })

  return (
    <div className={styles.layout}>
      {/* Filter sidebar */}
      <aside className={styles.sidebar}>
        <FilterSidebar onApply={handleApplyFilters} />
      </aside>

      {/* Results area */}
      <main className={styles.results}>
        <div className={styles.resultsHeader}>
          <h1 className={styles.heading}>Sök profiler</h1>
          {hasSearched && !isSearching && (
            <p className={styles.resultCount}>
              {profiles.length === 0
                ? 'Inga resultat'
                : `${profiles.length} profiler hittade`}
            </p>
          )}
        </div>

        {!hasSearched && (
          <div className={styles.prompt}>
            <div className={styles.promptIcon} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="18" cy="18" r="10" stroke="var(--color-copper)" strokeWidth="2" />
                <path
                  d="M26 26l6 6"
                  stroke="var(--color-copper)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className={styles.promptText}>
              Ange dina sökkriterier i filterpanelen och tryck <strong>Tillämpa filter</strong> för att hitta profiler.
            </p>
          </div>
        )}

        {isSearching && <DiscoverSkeleton />}

        {hasSearched && !isSearching && profiles.length === 0 && (
          <EmptyState
            title="Inga profiler hittades"
            description="Prova att justera dina filterinställningar för att se fler profiler."
          />
        )}

        {!isSearching && profiles.length > 0 && (
          <div
            className={styles.grid}
            role="list"
            aria-label={`${profiles.length} profiler`}
          >
            {profiles.map((profile, index) => (
              <div key={profile.id} role="listitem">
                <ProfileCard
                  profile={profile}
                  onLike={handleLike}
                  onPass={handlePass}
                  isFocused={focusedIndex === index}
                  cardIndex={index}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
