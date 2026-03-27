'use client'

import { useState, useEffect } from 'react'
import EmptyState from '@/components/common/EmptyState'
import DiscoverSkeleton from '@/components/discover/DiscoverSkeleton'
import { api } from '@/lib/trpc'
import styles from './page.module.css'

interface Match {
  id: string
  displayName: string
  age: number
  photos: string[]
  location: string
  matchedAt: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchMatches() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (api as any).match.getMatches.query()
        if (!cancelled) {
          setMatches(Array.isArray(result) ? result : [])
        }
      } catch {
        if (!cancelled) setMatches([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchMatches()
    return () => { cancelled = true }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Dina matchningar</h1>
        {matches.length > 0 && (
          <span className={styles.count}>{matches.length} matchningar</span>
        )}
      </div>

      {isLoading ? (
        <DiscoverSkeleton />
      ) : matches.length === 0 ? (
        <EmptyState
          title="Inga matchningar ännu"
          description="När du och en annan person båda gillar varandra visas matchningen här. Bläddra fler profiler för att öka chansen!"
          action={{
            label: 'Bläddra profiler',
            onClick: () => {
              window.location.href = '/discover/browse'
            },
          }}
        />
      ) : (
        <div className={styles.grid}>
          {matches.map((match) => (
            <div key={match.id} className={styles.matchCard}>
              <div className={styles.matchPhoto}>
                {match.photos[0] ? (
                  <img
                    src={match.photos[0]}
                    alt={`${match.displayName}s profilbild`}
                    className={styles.matchImg}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.matchPhotoPlaceholder} aria-hidden="true" />
                )}

                {/* Copper glow badge */}
                <div className={styles.matchBadge} aria-label="Matchad">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M6 10.5C6 10.5 1 7 1 4C1 2.3 2.3 1 4 1C4.9 1 5.7 1.4 6.2 2.1L6 2.4L5.8 2.1C5.3 1.4 4.5 1 3.6 1H4C5.7 1 7 2.3 7 4C7 7 6 10.5 6 10.5Z"
                      fill="none"
                    />
                    <path
                      d="M6 10.5C6 10.5 1 7 1 4C1 2.3 2.3 1 4 1C4.9 1 5.7 1.4 6.3 2.1L6 2.4L5.8 2.1C5.3 1.4 4.6 1 3.8 1H4C5.9 1 7.5 2.3 7.5 4C7.5 7 6 10.5 6 10.5Z"
                      fill="none"
                    />
                    <path
                      d="M6 10C6 10 1.5 7 1.5 4.2C1.5 2.7 2.7 1.5 4.2 1.5C5 1.5 5.7 1.9 6.2 2.5C6.7 1.9 7.4 1.5 8.2 1.5C9.7 1.5 10.9 2.7 10.9 4.2C10.9 7 6 10 6 10Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>

              <div className={styles.matchInfo}>
                <span className={styles.matchName}>{match.displayName}, {match.age}</span>
                <span className={styles.matchLocation}>{match.location}</span>
              </div>

              <button className={styles.chatBtn} aria-label={`Skicka meddelande till ${match.displayName}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M14 2H2C1.4 2 1 2.4 1 3v8c0 .6.4 1 1 1h2v2.5l3.5-2.5H14c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinejoin="round"
                  />
                </svg>
                Chatta
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
