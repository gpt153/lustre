'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { EventCard } from '@/components/events/EventCard'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import styles from './page.module.css'

export default function EventsPage() {
  const [eventType, setEventType] = useState<'ALL' | 'ONLINE' | 'IRL' | 'HYBRID'>('ALL')

  const listQuery = trpc.event.listFiltered.useInfiniteQuery(
    {
      limit: 12,
      type: eventType === 'ALL' ? undefined : eventType,
    },
    { getNextPageParam: (lastPage: any) => lastPage.nextCursor }
  )

  const events = (listQuery.data?.pages.flatMap((page: any) => page.events) ?? []) as any[]

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    return () => observer.disconnect()
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage])

  if (listQuery.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Event</h1>
          <Link href="/events/create" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Skapa event</Button>
          </Link>
        </div>

        <div className={styles.gridContainer}>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Event</h1>
        <Link href="/events/create" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Skapa event</Button>
        </Link>
      </div>

      <div className={styles.filterBar}>
        {(['ALL', 'ONLINE', 'IRL', 'HYBRID'] as const).map((type) => (
          <button
            key={type}
            className={`${styles.filterButton} ${eventType === type ? styles.active : ''}`}
            onClick={() => setEventType(type)}
          >
            {type === 'ALL' ? 'Alla event' : type}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Inga event hittades"
          description={eventType === 'ALL' ? 'Börja skapa ett event för att komma igång.' : `Inga ${eventType.toLowerCase()}-event hittades.`}
          action={
            <Link href="/events/create" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Skapa event</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className={styles.gridContainer}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

          {listQuery.isFetchingNextPage && (
            <div className={styles.loadMoreSpinner}>
              <div style={{ width: 24, height: 24, border: '2px solid var(--color-copper)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
