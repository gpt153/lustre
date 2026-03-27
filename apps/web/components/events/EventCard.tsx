'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: {
    id: string
    title: string
    startsAt: string
    locationName: string | null
    type: 'ONLINE' | 'IRL' | 'HYBRID'
    coverImageUrl: string | null
    _count?: { attendees: number }
  }
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startsAt)
  const formattedDate = startDate.toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const attendeeCount = event._count?.attendees ?? 0

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <div className={styles.eventCard}>
        {event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            width={400}
            height={225}
            className={styles.coverImage}
            priority={false}
          />
        ) : (
          <div className={styles.coverImage} style={{ backgroundColor: 'var(--bg-secondary)' }} />
        )}

        <div className={styles.cardBody}>
          <h3 className={styles.eventTitle}>{event.title}</h3>

          <div className={styles.eventMeta}>
            <span className={styles.metaItem}>📅 {formattedDate}</span>
            {event.locationName && (
              <span className={styles.metaItem}>📍 {event.locationName}</span>
            )}
          </div>

          <p className={styles.attendeeCount}>
            👥 {attendeeCount} {attendeeCount === 1 ? 'deltagare' : 'deltagare'}
          </p>

          <div className={styles.joinButton}>
            <Button variant="primary" size="md" type="button">
              Gå med
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
