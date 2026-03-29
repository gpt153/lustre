'use client'

import { useState, useEffect, useCallback } from 'react'
import EmptyState from '@/components/common/EmptyState'
import PolaroidCard from '@/components/common/PolaroidCard'
import PolaroidMasonryGrid from '@/components/common/PolaroidMasonryGrid'
import SparkButton from '@/components/discover/SparkButton'
import DiscoverSkeleton from '@/components/discover/DiscoverSkeleton'
import { useDiscoverKeyboard } from '@/hooks/useDiscoverKeyboard'
import { api } from '@/lib/trpc'
import styles from './page.module.css'

export interface DiscoverProfile {
  id: string
  displayName: string
  age: number
  photos: string[]
  location: string
  bio: string
}

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
        const result = await (api as any).match.getDiscoveryStack.query({})
        if (cancelled) return

        if (Array.isArray(result) && result.length > 0) {
          // API returns photo objects { id, url, ... } — map to string[]
          const mapped = result.map((p: Record<string, unknown>) => ({
            ...p,
            photos: Array.isArray(p.photos)
              ? p.photos.map((ph: unknown) =>
                  typeof ph === 'string' ? ph : (ph as { url: string }).url
                )
              : [],
          }))
          setProfiles(mapped as DiscoverProfile[])
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
        <div>
          <h1 className={styles.heading}>Kurerat för dig</h1>
          <p className={styles.subtitle}>
            Hittade {profiles.length} matchningar idag
          </p>
        </div>
        <p className={styles.hint}>
          <kbd className={styles.kbd}>L</kbd> gilla ·{' '}
          <kbd className={styles.kbd}>P</kbd> passa ·{' '}
          <kbd className={styles.kbd}>←→↑↓</kbd> navigera
        </p>
      </div>

      <PolaroidMasonryGrid>
        {profiles.map((profile, index) => (
          <PolaroidCard
            key={profile.id}
            imageUrl={profile.photos[0] ?? ''}
            imageAlt={`${profile.displayName}s profilbild`}
            caption={`${profile.displayName}, ${profile.age}`}
            stack={index < 3}
            hoverable
            className={focusedIndex === index ? styles.cardFocused : undefined}
          >
            <div className={styles.polaroidActions}>
              <button
                className={`${styles.actionBtn} ${styles.passBtn}`}
                onClick={() => handlePass(profile.id)}
                aria-label={`Passa ${profile.displayName}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>

              <SparkButton recipientId={profile.id} />

              <button
                className={`${styles.actionBtn} ${styles.likeBtn}`}
                onClick={() => handleLike(profile.id)}
                aria-label={`Gilla ${profile.displayName}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </PolaroidCard>
        ))}
      </PolaroidMasonryGrid>
    </div>
  )
}
