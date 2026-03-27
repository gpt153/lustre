'use client'

import { useState, useEffect, useCallback } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ProfileCard from '@/components/discover/ProfileCard'
import DiscoverSkeleton from '@/components/discover/DiscoverSkeleton'
import { useDiscoverKeyboard } from '@/hooks/useDiscoverKeyboard'
import { api } from '@/lib/trpc'
import type { DiscoverProfile } from '@/components/discover/ProfileCard'
import styles from './page.module.css'

/* ---- Mock data — used as fallback when the API is not reachable ---- */

const MOCK_PROFILES: DiscoverProfile[] = [
  {
    id: '1',
    displayName: 'Emma',
    age: 28,
    photos: [],
    location: 'Stockholm',
    bio: 'Nyfiken på livet och på vad det kan erbjuda. Tycker om långa promenader, bra samtal och att utforska nya saker.',
  },
  {
    id: '2',
    displayName: 'Sofia',
    age: 31,
    photos: [],
    location: 'Göteborg',
    bio: 'Konstnär och äventyrare. Letar efter någon att dela spontana utflykter och kreativa projekt med.',
  },
  {
    id: '3',
    displayName: 'Lina',
    age: 25,
    photos: [],
    location: 'Malmö',
    bio: 'Yogainstruktör på dagen, bookworm på kvällen. Uppskattar ärlighet och närvaro.',
  },
  {
    id: '4',
    displayName: 'Alex',
    age: 33,
    photos: [],
    location: 'Uppsala',
    bio: 'Jobbar med hållbarhet och älskar att laga mat. Söker genuina kopplingar — inte performativa.',
  },
  {
    id: '5',
    displayName: 'Maja',
    age: 27,
    photos: [],
    location: 'Stockholm',
    bio: 'Musiker och filmfantast. Skrattar för mycket och bor med en katt som dömer mig konstant.',
  },
  {
    id: '6',
    displayName: 'Julia',
    age: 30,
    photos: [],
    location: 'Linköping',
    bio: 'Arkitekt med passion för design och urbana rum. Söker djupa samtal och delade äventyr.',
  },
  {
    id: '7',
    displayName: 'Klara',
    age: 26,
    photos: [],
    location: 'Stockholm',
    bio: 'Reser gärna, helst till okända platser. Just hemma igen efter ett år i Sydamerika.',
  },
  {
    id: '8',
    displayName: 'Ida',
    age: 29,
    photos: [],
    location: 'Västerås',
    bio: 'Sjuksköterska med stort hjärta. På fritiden löper jag, pysslar med trädgård och ser dåliga filmer.',
  },
]

type LoadState = 'loading' | 'loaded' | 'error'

export default function BrowsePage() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')

  useEffect(() => {
    let cancelled = false

    async function fetchProfiles() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (api as any).match.getDiscoveryStack.query()
        if (cancelled) return

        if (Array.isArray(result) && result.length > 0) {
          setProfiles(result)
        } else {
          // Empty result — show mock data in development
          setProfiles(MOCK_PROFILES)
        }
        setLoadState('loaded')
      } catch {
        if (cancelled) return
        // API not reachable — fall back to mock profiles silently
        setProfiles(MOCK_PROFILES)
        setLoadState('loaded')
      }
    }

    fetchProfiles()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLike = useCallback((id: string) => {
    console.log('[Discover] Like:', id)
    // TODO: Integrate match.swipe mutation in match animation epic
  }, [])

  const handlePass = useCallback((id: string) => {
    console.log('[Discover] Pass:', id)
    // TODO: Integrate match.swipe mutation in match animation epic
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

  const handleExpand = useCallback((index: number) => {
    console.log('[Discover] Expand card at index:', index)
    // TODO: Open profile detail modal
  }, [])

  const { focusedIndex } = useDiscoverKeyboard({
    totalCards: profiles.length,
    columns: 3,
    onLike: handleLikeByIndex,
    onPass: handlePassByIndex,
    onExpand: handleExpand,
  })

  if (loadState === 'loading') {
    return <DiscoverSkeleton />
  }

  if (loadState === 'loaded' && profiles.length === 0) {
    return (
      <EmptyState
        title="Inga profiler hittades"
        description="Det verkar som att du har sett alla profiler i närheten. Försök justera dina filter eller kom tillbaka lite senare."
        action={{ label: 'Justera filter', onClick: () => {} }}
      />
    )
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Bläddra profiler</h1>
        <p className={styles.hint}>
          Tryck <kbd className={styles.kbd}>L</kbd> för gilla ·{' '}
          <kbd className={styles.kbd}>P</kbd> för passa ·{' '}
          <kbd className={styles.kbd}>←→↑↓</kbd> för navigera
        </p>
      </div>

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
    </div>
  )
}
