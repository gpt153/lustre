'use client'

import { m } from 'motion/react'
import { springs, slideUp } from '@/lib/motion'
import styles from './EventCard.module.css'

export interface EventCardData {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: 'IRL' | 'Online' | 'Hybrid'
  attendeeCount: number
  maxAttendees?: number
  rsvpStatus?: 'GOING' | 'WAITLIST' | null
  imageUrl?: string
  organizer: string
}

interface EventCardProps {
  event: EventCardData
  onClick?: (id: string) => void
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('sv-SE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const TYPE_LABELS: Record<EventCardData['type'], string> = {
  IRL: 'IRL',
  Online: 'Online',
  Hybrid: 'Hybrid',
}

export default function EventCard({ event, onClick }: EventCardProps) {
  return (
    <m.article
      className={styles.card}
      variants={slideUp}
      transition={springs.soft}
      onClick={() => onClick?.(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(event.id)
      }}
      aria-label={`Evenemang: ${event.title}`}
      whileHover={{ y: -3, transition: springs.default }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image placeholder */}
      <div className={styles.imagePlaceholder} aria-hidden="true">
        <div className={styles.imagePlaceholderInner}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M26 6H6C4.9 6 4 6.9 4 8v16c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 18H6V8h20v16zM11 14a2 2 0 100-4 2 2 0 000 4zm10 4l-4-4-3 3-2-2-4 5h16l-3-2z"
              fill="currentColor"
              opacity="0.4"
            />
          </svg>
        </div>
        <span className={`${styles.typeBadge} ${styles[`type_${event.type}`]}`}>
          {TYPE_LABELS[event.type]}
        </span>
        {event.rsvpStatus === 'GOING' && (
          <span className={styles.rsvpBadge}>Anmäld</span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{event.title}</h3>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 2v2M9 2v2M2 6h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {formatDate(event.date)} · {event.time}
          </span>

          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 1.5C5 1.5 3.5 3 3.5 5c0 3 3.5 7 3.5 7s3.5-4 3.5-7c0-2-1.5-3.5-3.5-3.5zm0 4.5a1 1 0 110-2 1 1 0 010 2z"
                fill="currentColor"
                opacity="0.7"
              />
            </svg>
            {event.location}
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.attendees}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 11c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="10" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11.5 11c0-1.5-1-2.7-2.3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {event.attendeeCount}
            {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} deltagare
          </span>
          <span className={styles.organizer}>{event.organizer}</span>
        </div>
      </div>
    </m.article>
  )
}
