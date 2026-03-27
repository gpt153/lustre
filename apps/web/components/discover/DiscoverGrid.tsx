'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'
import { ProfileCard } from '@/components/discover/ProfileCard'
import type { DiscoverProfile } from '@/components/discover/ProfileCard'
import { FilterSidebar } from '@/components/discover/FilterSidebar'
import type { DiscoverFilters } from '@/components/discover/FilterSidebar'
import { SkeletonProfileGrid } from '@/components/discover/SkeletonProfileGrid'
import { useDiscoverKeyboard } from '@/hooks/useDiscoverKeyboard'
import styles from './DiscoverGrid.module.css'

const DEFAULT_FILTERS: DiscoverFilters = {
  maxDistance: 50,
  ageMin: 18,
  ageMax: 60,
  mode: 'all',
  interests: [],
}

interface DiscoverGridProps {
  initialProfiles?: DiscoverProfile[]
}

export function DiscoverGrid({ initialProfiles = [] }: DiscoverGridProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(true)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [loadedProfiles, setLoadedProfiles] = useState<DiscoverProfile[]>(initialProfiles)
  const [fetchLimit, setFetchLimit] = useState(initialProfiles.length > 0 ? 0 : 20)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const prevFiltersRef = useRef(filters)

  const { data: freshData, isLoading, isFetching } = trpc.match.getDiscoveryStack.useQuery(
    { limit: 20 },
    {
      enabled: fetchLimit > 0,
      staleTime: 30_000,
    }
  )

  const swipeMutation = trpc.match.swipe.useMutation()

  useEffect(() => {
    if (!freshData) return
    setLoadedProfiles((prev) => {
      const existingIds = new Set(prev.map((p) => p.userId))
      const newOnes = (freshData as unknown as DiscoverProfile[]).filter((p) => !existingIds.has(p.userId))
      return [...prev, ...newOnes]
    })
    setFetchLimit(0)
  }, [freshData])

  useEffect(() => {
    const prevF = prevFiltersRef.current
    const changed =
      prevF.maxDistance !== filters.maxDistance ||
      prevF.ageMin !== filters.ageMin ||
      prevF.ageMax !== filters.ageMax ||
      prevF.mode !== filters.mode
    if (changed) {
      prevFiltersRef.current = filters
      setRemovedIds(new Set())
      setLoadedProfiles([])
      setFetchLimit(20)
    }
  }, [filters])

  const allProfiles = loadedProfiles.filter((p) => !removedIds.has(p.userId))
  const visibleIds = allProfiles.map((p) => p.userId)

  const removeAndShiftFocus = useCallback(
    (userId: string, delay: number) => {
      setTimeout(() => {
        setRemovedIds((prev) => new Set([...prev, userId]))
        setFocusedId((prev) => {
          if (prev !== userId) return prev
          const idx = visibleIds.indexOf(userId)
          return visibleIds[idx + 1] ?? visibleIds[idx - 1] ?? null
        })
      }, delay)
    },
    [visibleIds]
  )

  const handleLike = useCallback(
    (userId: string) => {
      swipeMutation.mutate({ targetId: userId, action: 'LIKE' })
      removeAndShiftFocus(userId, 650)
    },
    [swipeMutation, removeAndShiftFocus]
  )

  const handlePass = useCallback(
    (userId: string) => {
      swipeMutation.mutate({ targetId: userId, action: 'PASS' })
      removeAndShiftFocus(userId, 450)
    },
    [swipeMutation, removeAndShiftFocus]
  )

  const handleSuperLike = useCallback(
    (userId: string) => {
      swipeMutation.mutate({ targetId: userId, action: 'LIKE' })
      removeAndShiftFocus(userId, 650)
    },
    [swipeMutation, removeAndShiftFocus]
  )

  const handleOpen = useCallback(
    (userId: string) => {
      router.push(`/profile/${userId}`)
    },
    [router]
  )

  const handleFocusCard = useCallback((userId: string) => {
    setFocusedId(userId)
  }, [])

  useDiscoverKeyboard({
    profileIds: visibleIds,
    focusedId,
    onFocus: setFocusedId,
    onLike: handleLike,
    onPass: handlePass,
    onSuperLike: handleSuperLike,
    onOpen: handleOpen,
  })

  useEffect(() => {
    if (!sentinelRef.current || fetchLimit > 0 || isFetching) return
    if (allProfiles.length < 4) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setFetchLimit(20)
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [fetchLimit, isFetching, allProfiles.length])

  useEffect(() => {
    if (!focusedId) return
    const el = document.querySelector(`[data-userid="${focusedId}"]`) as HTMLElement
    el?.focus({ preventScroll: false })
  }, [focusedId])

  if (isLoading && loadedProfiles.length === 0) {
    return (
      <div className={styles.wrapper}>
        <DiscoverNav />
        <SkeletonProfileGrid />
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <DiscoverNav
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
      />

      <div className={styles.layout}>
        {showFilters && (
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        <div className={styles.gridArea}>
          <div className={styles.shortcutHint} aria-label="Keyboard shortcuts">
            <span className={styles.shortcutItem}>
              <kbd className={styles.key}>L</kbd> Like
            </span>
            <span className={styles.shortcutItem}>
              <kbd className={styles.key}>P</kbd> Pass
            </span>
            <span className={styles.shortcutItem}>
              <kbd className={styles.key}>S</kbd> Super
            </span>
            <span className={styles.shortcutItem}>
              <kbd className={styles.key}>↵</kbd> Open
            </span>
            <span className={styles.shortcutItem}>
              <kbd className={styles.key}>↑↓←→</kbd> Navigate
            </span>
          </div>

          {allProfiles.length === 0 && !isFetching ? (
            <div className={styles.empty} role="status">
              <span className={styles.emptyIcon}>✦</span>
              <span>No more profiles to discover</span>
              <span style={{ fontSize: 13 }}>Check back later or adjust your filters</span>
            </div>
          ) : (
            <div
              className={styles.grid}
              role="list"
              aria-label="Discovery profiles"
            >
              {allProfiles.map((profile, index) => (
                <ProfileCard
                  key={profile.userId}
                  profile={profile}
                  index={index}
                  focused={focusedId === profile.userId}
                  onLike={handleLike}
                  onPass={handlePass}
                  onSuperLike={handleSuperLike}
                  onOpen={handleOpen}
                  onFocus={handleFocusCard}
                />
              ))}
            </div>
          )}

          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

          {isFetching && loadedProfiles.length > 0 && (
            <div className={styles.loadingMore} aria-live="polite" aria-label="Loading more profiles">
              <div className={styles.spinner} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface DiscoverNavProps {
  showFilters?: boolean
  onToggleFilters?: () => void
}

function DiscoverNav({ showFilters, onToggleFilters }: DiscoverNavProps) {
  return (
    <nav className={styles.nav} aria-label="Discover navigation">
      <Link href="/discover/intentions" className={styles.navLink}>
        Intentioner
      </Link>
      <Link
        href="/discover"
        className={`${styles.navLink} ${styles.navLinkActive}`}
        aria-current="page"
      >
        Discover
      </Link>
      <Link href="/discover/search" className={styles.navLink}>
        Search
      </Link>
      <Link href="/discover/matches" className={styles.navLink}>
        Matches
      </Link>

      {onToggleFilters && (
        <button
          className={styles.filterToggle}
          onClick={onToggleFilters}
          type="button"
          aria-pressed={showFilters}
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filters
        </button>
      )}
    </nav>
  )
}
