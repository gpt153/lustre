'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { m, AnimatePresence } from 'motion/react'
import { springs, fadeIn, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import { useAuthStore } from '@/lib/stores'

import Button from '@/components/common/Button'
import Skeleton from '@/components/common/Skeleton'
import styles from './page.module.css'

interface EventDetail {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime?: string
  location: string
  type: 'IRL' | 'Online' | 'Hybrid'
  attendeeCount: number
  maxAttendees?: number
  rsvpStatus: 'GOING' | 'WAITLIST' | null
  organizer: string
  organizerAvatarUrl?: string
  attendees: Array<{ id: string; displayName: string; photoUrl?: string }>
  tags?: string[]
}

const MOCK_EVENTS: Record<string, EventDetail> = {
  ev1: {
    id: 'ev1',
    title: 'Mingel & Mys — Höstens optigaste dejtingevent',
    description:
      'Välkommen till Lustres egna mingel- och dejtevent! Det här är kvällen för dig som vill träffa likasinnade i en varm, avslappnad atmosfär. Vi har ordnat med mingel, aktiviteter och möjligheten att knyta nya kontakter utan press. Kaffe, te och lätta tilltugg ingår. Klädkod: smart casual.',
    date: '2026-04-05T18:00:00Z',
    time: '18:00',
    endTime: '21:00',
    location: 'Södermalmstorg 6, Stockholm',
    type: 'IRL',
    attendeeCount: 34,
    maxAttendees: 50,
    rsvpStatus: null,
    organizer: 'Lustre Events',
    attendees: [
      { id: 'u1', displayName: 'Emma' },
      { id: 'u2', displayName: 'Sofia' },
      { id: 'u3', displayName: 'Lina' },
      { id: 'u4', displayName: 'Maja' },
      { id: 'u5', displayName: 'Alex' },
    ],
    tags: ['Mingel', 'Dejting', 'Stockholm', 'Social'],
  },
  ev2: {
    id: 'ev2',
    title: 'Tantric Talk — Kropp & Närvaro Online',
    description:
      'En onlinesession om tantrik, kroppsnärvaro och intim kommunikation. Vi utforskar hur vi kan vara mer närvarande med oss själva och andra. Workshoppen leds av en certifierad tantrikterapeut och är öppen för alla oavsett erfarenhet.',
    date: '2026-04-10T19:30:00Z',
    time: '19:30',
    endTime: '21:30',
    location: 'Zoom (länk skickas till anmälda)',
    type: 'Online',
    attendeeCount: 87,
    rsvpStatus: 'GOING',
    organizer: 'Lustres Hälsokollektiv',
    attendees: [
      { id: 'u1', displayName: 'Emma' },
      { id: 'u6', displayName: 'Jonas' },
      { id: 'u7', displayName: 'Karin' },
      { id: 'u8', displayName: 'David' },
    ],
    tags: ['Tantrik', 'Online', 'Wellness', 'Närvaro'],
  },
}

function getFallbackEvent(id: string): EventDetail {
  return (
    MOCK_EVENTS[id] ?? {
      id,
      title: 'Evenemang',
      description: 'Beskrivning saknas.',
      date: new Date().toISOString(),
      time: '18:00',
      location: 'Okänd plats',
      type: 'IRL',
      attendeeCount: 0,
      rsvpStatus: null,
      organizer: 'Okänd arrangör',
      attendees: [],
    }
  )
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const TYPE_LABELS = { IRL: 'IRL', Online: 'Online', Hybrid: 'Hybrid' }

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params?.eventId as string
  const userId = useAuthStore((s) => s.userId)

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState<'GOING' | 'WAITLIST' | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const result = await api.event.get.query({ eventId })
        setEvent(result)
        setRsvpStatus(result.rsvpStatus ?? null)
      } catch {
        const fallback = getFallbackEvent(eventId)
        setEvent(fallback)
        setRsvpStatus(fallback.rsvpStatus)
      } finally {
        setIsLoading(false)
      }
    }
    if (eventId) load()
  }, [eventId])

  async function handleRsvp() {
    if (!userId || !event) return
    setRsvpLoading(true)
    try {
      if (rsvpStatus === 'GOING') {
        await api.event.rsvp.mutate({ eventId: event.id, status: 'DECLINED' })
        setRsvpStatus(null)
      } else {
        await api.event.rsvp.mutate({ eventId: event.id, status: 'GOING' })
        setRsvpStatus('GOING')
      }
    } catch {
      // Optimistic fallback
      setRsvpStatus((prev) => (prev === 'GOING' ? null : 'GOING'))
    } finally {
      setRsvpLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Back button */}
      <m.button
        className={styles.backBtn}
        onClick={() => router.back()}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={springs.soft}
        aria-label="Tillbaka till evenemang"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Tillbaka
      </m.button>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <m.div
            key="skeleton"
            className={styles.skeleton}
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="initial"
          >
            <Skeleton shape="image" height={280} borderRadius={16} />
            <div className={styles.skeletonContent}>
              <Skeleton shape="text" width="80%" height={28} />
              <Skeleton shape="text" width="50%" height={16} />
              <Skeleton shape="text" width="60%" height={16} />
              <Skeleton shape="text" lines={4} height={14} />
            </div>
          </m.div>
        ) : event ? (
          <m.div
            key="content"
            className={styles.content}
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={springs.soft}
          >
            {/* Hero */}
            <div className={styles.hero} aria-hidden="true">
              <div className={styles.heroPlaceholder}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M39 9H9C7.35 9 6 10.35 6 12v24c0 1.65 1.35 3 3 3h30c1.65 0 3-1.35 3-3V12c0-1.65-1.35-3-3-3zm0 27H9V12h30v24zM16.5 21a3 3 0 100-6 3 3 0 000 6zm15 6l-6-6-4.5 4.5-3-3-6 7.5h24l-4.5-3z"
                    fill="currentColor"
                    opacity="0.35"
                  />
                </svg>
              </div>
              <span className={`${styles.typeBadge} ${styles[`type_${event.type}`]}`}>
                {TYPE_LABELS[event.type]}
              </span>
            </div>

            {/* Details */}
            <div className={styles.details}>
              {/* Title & organizer */}
              <div className={styles.titleSection}>
                <h1 className={styles.title}>{event.title}</h1>
                <p className={styles.organizer}>Arrangerat av · {event.organizer}</p>
              </div>

              {/* Info row */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Datum</span>
                  <span className={styles.infoValue}>{formatFullDate(event.date)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tid</span>
                  <span className={styles.infoValue}>
                    {event.time}{event.endTime ? ` — ${event.endTime}` : ''}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Plats</span>
                  <span className={styles.infoValue}>{event.location}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Deltagare</span>
                  <span className={styles.infoValue}>
                    {event.attendeeCount}
                    {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} anmälda
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className={styles.descriptionSection}>
                <h2 className={styles.sectionHeading}>Om eventet</h2>
                <p className={styles.description}>{event.description}</p>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className={styles.tags}>
                  {event.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Attendee avatars */}
              {event.attendees.length > 0 && (
                <div className={styles.attendeesSection}>
                  <h2 className={styles.sectionHeading}>
                    Deltagare ({event.attendeeCount})
                  </h2>
                  <div className={styles.avatarRow}>
                    {event.attendees.slice(0, 8).map((a) => (
                      <div
                        key={a.id}
                        className={styles.avatar}
                        title={a.displayName}
                        aria-label={a.displayName}
                      >
                        {a.displayName.charAt(0)}
                      </div>
                    ))}
                    {event.attendeeCount > 8 && (
                      <div className={styles.avatarMore}>
                        +{event.attendeeCount - 8}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RSVP */}
              <div className={styles.rsvpSection}>
                {rsvpStatus === 'GOING' ? (
                  <div className={styles.rsvpConfirmed}>
                    <span className={styles.rsvpCheck}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    Du är anmäld!
                  </div>
                ) : null}
                <Button
                  variant={rsvpStatus === 'GOING' ? 'secondary' : 'primary'}
                  size="lg"
                  fullWidth
                  loading={rsvpLoading}
                  onClick={handleRsvp}
                  className={rsvpStatus !== 'GOING' ? styles.copperBtn : undefined}
                >
                  {rsvpStatus === 'GOING' ? 'Avboka' : 'Anmäl dig'}
                </Button>
              </div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
