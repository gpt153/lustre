'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

import EventCard, { type EventCardData } from '@/components/events/EventCard'
import EmptyState from '@/components/common/EmptyState'
import Skeleton from '@/components/common/Skeleton'
import styles from './page.module.css'

type FilterType = 'Alla' | 'IRL' | 'Online' | 'Hybrid'

const MOCK_EVENTS: EventCardData[] = [
  {
    id: 'ev1',
    title: 'Mingel & Mys — Höstens optigaste dejtingevent',
    date: '2026-04-05T18:00:00Z',
    time: '18:00',
    location: 'Södermalm, Stockholm',
    type: 'IRL',
    attendeeCount: 34,
    maxAttendees: 50,
    rsvpStatus: null,
    organizer: 'Lustre Events',
  },
  {
    id: 'ev2',
    title: 'Tantric Talk — Kropp & Närvaro Online',
    date: '2026-04-10T19:30:00Z',
    time: '19:30',
    location: 'Zoom (länk skickas)',
    type: 'Online',
    attendeeCount: 87,
    rsvpStatus: 'GOING',
    organizer: 'Lustres Hälsokollektiv',
  },
  {
    id: 'ev3',
    title: 'Polyworkshop — Kommunikation & Gränser',
    date: '2026-04-19T14:00:00Z',
    time: '14:00',
    location: 'Göteborg Centrum',
    type: 'IRL',
    attendeeCount: 22,
    maxAttendees: 30,
    rsvpStatus: null,
    organizer: 'Kärlek Utan Gränser',
  },
  {
    id: 'ev4',
    title: 'BDSM 101 — Introduktionskurs (Hybrid)',
    date: '2026-04-26T17:00:00Z',
    time: '17:00',
    location: 'Malmö + Livestream',
    type: 'Hybrid',
    attendeeCount: 56,
    maxAttendees: 75,
    rsvpStatus: null,
    organizer: 'Dark Bloom Collective',
  },
  {
    id: 'ev5',
    title: 'Speed Dating — Sinnliga singelkvällar',
    date: '2026-05-02T19:00:00Z',
    time: '19:00',
    location: 'Norrmalm, Stockholm',
    type: 'IRL',
    attendeeCount: 48,
    maxAttendees: 48,
    rsvpStatus: null,
    organizer: 'Lustre Events',
  },
  {
    id: 'ev6',
    title: 'Intimitetsmöte — Digital dejting i fokus',
    date: '2026-05-08T20:00:00Z',
    time: '20:00',
    location: 'Google Meet (länk skickas)',
    type: 'Online',
    attendeeCount: 112,
    rsvpStatus: 'GOING',
    organizer: 'Lustres Hälsokollektiv',
  },
]

const FILTERS: FilterType[] = ['Alla', 'IRL', 'Online', 'Hybrid']

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<EventCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('Alla')

  useEffect(() => {
    async function load() {
      try {
        const result = await api.event.list.query({})
        setEvents(Array.isArray(result) && result.length > 0 ? result : MOCK_EVENTS)
      } catch {
        setEvents(MOCK_EVENTS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered =
    activeFilter === 'Alla'
      ? events
      : events.filter((e) => e.type === activeFilter)

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <m.div
          className={styles.headerContent}
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={springs.soft}
        >
          <h1 className={styles.heading}>Evenemang</h1>
          <p className={styles.subheading}>Hitta och delta i events nära dig</p>
        </m.div>
      </header>

      {/* Filter tabs */}
      <m.div
        className={styles.filterRow}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.05 }}
        role="tablist"
        aria-label="Filtrera evenemang"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.filterTab} ${activeFilter === f ? styles.filterTabActive : ''}`}
            onClick={() => setActiveFilter(f)}
            role="tab"
            aria-selected={activeFilter === f}
            aria-label={`Visa ${f} evenemang`}
          >
            {f}
          </button>
        ))}
      </m.div>

      {/* Content */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <m.div
              key="skeleton"
              className={styles.grid}
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <Skeleton shape="image" height={160} />
                  <div className={styles.skeletonContent}>
                    <Skeleton shape="text" width="80%" height={18} />
                    <Skeleton shape="text" width="60%" height={14} />
                    <Skeleton shape="text" width="50%" height={14} />
                  </div>
                </div>
              ))}
            </m.div>
          ) : filtered.length === 0 ? (
            <m.div
              key="empty"
              variants={slideUp}
              initial="initial"
              animate="animate"
              transition={springs.soft}
            >
              <EmptyState
                title="Inga evenemang hittades"
                description={
                  activeFilter === 'Alla'
                    ? 'Det finns inga evenemang just nu. Kom tillbaka snart!'
                    : `Det finns inga ${activeFilter}-evenemang just nu.`
                }
              />
            </m.div>
          ) : (
            <m.div
              key="grid"
              className={styles.grid}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={(id) => router.push(`/events/${id}`)}
                />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
