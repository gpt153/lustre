'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { m } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import AchievementBadge from '@/components/learn/AchievementBadge'
import StreakWidget from '@/components/learn/StreakWidget'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

interface Badge {
  id: string
  name: string
  description?: string
  moduleOrder: number
  earned: boolean
  earnedAt?: string | null
}

interface Medal {
  id: string
  key: string
  name: string
  description?: string
  earned: boolean
  earnedAt?: string | null
}

interface Streak {
  currentStreak: number
  longestStreak: number
  lastActivityAt?: string | null
}

const MOCK_BADGES: Badge[] = [
  { id: 'b1', name: 'Modig start', moduleOrder: 1, earned: true, earnedAt: '2026-03-20T10:00:00Z', description: 'Slutförde modul 1' },
  { id: 'b2', name: 'Lyssnaren', moduleOrder: 2, earned: false, description: 'Slutför modul 2' },
  { id: 'b3', name: 'Klarspråk', moduleOrder: 3, earned: false, description: 'Slutför modul 3' },
  { id: 'b4', name: 'Gränsvakt', moduleOrder: 4, earned: false, description: 'Slutför modul 4' },
  { id: 'b5', name: 'Hjärtnärvaro', moduleOrder: 5, earned: false, description: 'Slutför modul 5' },
  { id: 'b6', name: 'Närvaro', moduleOrder: 6, earned: false, description: 'Slutför modul 6' },
  { id: 'b7', name: 'Förtroende', moduleOrder: 7, earned: false, description: 'Slutför modul 7' },
  { id: 'b8', name: 'Djupet', moduleOrder: 8, earned: false, description: 'Slutför modul 8' },
  { id: 'b9', name: 'Mästerskap', moduleOrder: 9, earned: false, description: 'Slutför modul 9' },
  { id: 'b10', name: 'Ledarens väg', moduleOrder: 10, earned: false, description: 'Slutför modul 10' },
  { id: 'b101', name: 'Samtyckesexpert', moduleOrder: 101, earned: false, description: 'Slutför spicy modul 1' },
  { id: 'b102', name: 'Ordets kraft', moduleOrder: 102, earned: false, description: 'Slutför spicy modul 2' },
]

const MOCK_MEDALS: Medal[] = [
  { id: 'm1', key: 'brave_first_step', name: 'Första steget', description: 'Slutförde din allra första lektion', earned: true, earnedAt: '2026-03-20T10:30:00Z' },
  { id: 'm2', key: 'week_warrior', name: 'Veckokrigaren', description: '7 dagar i rad med aktiv träning', earned: false },
  { id: 'm3', key: 'century_club', name: 'Hundraklubb', description: '100 lektioner totalt', earned: false },
  { id: 'm4', key: 'speed_demon', name: 'Snabbspurten', description: 'Slutförde en modul på under 24 timmar', earned: false },
  { id: 'm5', key: 'empathy_master', name: 'Empatimaster', description: 'Fick toppbetyg i 5 lektioner om lyssning', earned: false },
]

const MOCK_STREAK: Streak = { currentStreak: 4, longestStreak: 12, lastActivityAt: new Date().toISOString() }

const MEDAL_EMOJIS: Record<string, string> = {
  brave_first_step: '🌱',
  week_warrior: '⚔️',
  century_club: '💯',
  speed_demon: '⚡',
  empathy_master: '💙',
}

export default function AchievementsPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [medals, setMedals] = useState<Medal[]>([])
  const [streak, setStreak] = useState<Streak>(MOCK_STREAK)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [badgeResult, medalResult, streakResult] = await Promise.all([
          api.gamification.getBadges.query(),
          api.gamification.getMedals.query(),
          api.gamification.getStreak.query(),
        ])
        setBadges(badgeResult)
        setMedals(medalResult)
        setStreak(streakResult)
      } catch {
        setBadges(MOCK_BADGES)
        setMedals(MOCK_MEDALS)
        setStreak(MOCK_STREAK)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const displayBadges = isLoading ? MOCK_BADGES : badges
  const displayMedals = isLoading ? MOCK_MEDALS : medals
  const earnedBadges = displayBadges.filter(b => b.earned)
  const lockedBadges = displayBadges.filter(b => !b.earned)
  const earnedMedals = displayMedals.filter(m => m.earned)


  const lastActivityStr = streak.lastActivityAt
    ? new Date(streak.lastActivityAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })
    : null

  return (
    <div className={styles.page}>
      {/* Back link */}
      <m.div variants={fadeIn} initial="initial" animate="animate" transition={springs.soft}>
        <Link href="/learn" className={styles.backLink}>← Lärande</Link>
      </m.div>

      {/* Header */}
      <m.div
        className={styles.header}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.05 }}
      >
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>Din progress</span>
          <h1 className={styles.heading}>Prestationer</h1>
          <p className={styles.subheading}>Badges, medaljer och din dagliga streak</p>
        </div>
        <div className={styles.headerRight}>
          <StreakWidget
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
          />
        </div>
      </m.div>

      {/* Streak summary */}
      <m.div
        className={styles.streakCard}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.1 }}
      >
        <div className={styles.streakStat}>
          <span className={styles.streakEmoji}>🔥</span>
          <div className={styles.streakStatBody}>
            <span className={styles.streakValue}>{streak.currentStreak}</span>
            <span className={styles.streakLabel}>Nuvarande streak</span>
          </div>
        </div>
        <div className={styles.streakDivider} />
        <div className={styles.streakStat}>
          <span className={styles.streakEmoji}>🏆</span>
          <div className={styles.streakStatBody}>
            <span className={styles.streakValue}>{streak.longestStreak}</span>
            <span className={styles.streakLabel}>Längsta streak</span>
          </div>
        </div>
        <div className={styles.streakDivider} />
        <div className={styles.streakStat}>
          <span className={styles.streakEmoji}>🎖️</span>
          <div className={styles.streakStatBody}>
            <span className={styles.streakValue}>{earnedBadges.length}</span>
            <span className={styles.streakLabel}>Badges upplåsta</span>
          </div>
        </div>
        {lastActivityStr && (
          <>
            <div className={styles.streakDivider} />
            <div className={styles.streakStat}>
              <span className={styles.streakEmoji}>📅</span>
              <div className={styles.streakStatBody}>
                <span className={styles.streakValueSm}>{lastActivityStr}</span>
                <span className={styles.streakLabel}>Senaste aktivitet</span>
              </div>
            </div>
          </>
        )}
      </m.div>

      {/* Badges section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Modul-badges</span>
          <span className={styles.sectionCount}>{earnedBadges.length}/{displayBadges.length}</span>
        </div>

        {earnedBadges.length > 0 && (
          <div className={styles.badgeSubsection}>
            <span className={styles.subsectionLabel}>Upplåsta</span>
            <m.div
              className={styles.badgeGrid}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {earnedBadges.map((badge, i) => (
                <AchievementBadge
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  moduleOrder={badge.moduleOrder}
                  earned={true}
                  earnedAt={badge.earnedAt}
                  index={i}
                />
              ))}
            </m.div>
          </div>
        )}

        {lockedBadges.length > 0 && (
          <div className={styles.badgeSubsection}>
            <span className={styles.subsectionLabel}>Låsta</span>
            <m.div
              className={styles.badgeGrid}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {lockedBadges.map((badge, i) => (
                <AchievementBadge
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  moduleOrder={badge.moduleOrder}
                  earned={false}
                  index={i}
                />
              ))}
            </m.div>
          </div>
        )}
      </section>

      {/* Medals section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Medaljer</span>
          <span className={styles.sectionCount}>{earnedMedals.length}/{displayMedals.length}</span>
        </div>

        <m.div
          className={styles.medalList}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {displayMedals.map((medal, i) => (
            <m.div
              key={medal.id}
              className={[styles.medalRow, medal.earned ? styles.medalEarned : styles.medalLocked].join(' ')}
              variants={slideUp}
              transition={{ ...springs.soft, delay: i * 0.05 }}
            >
              <div className={styles.medalIcon}>
                {MEDAL_EMOJIS[medal.key] ?? '🏅'}
              </div>
              <div className={styles.medalBody}>
                <span className={styles.medalName}>{medal.name}</span>
                {medal.description && <span className={styles.medalDesc}>{medal.description}</span>}
              </div>
              {medal.earned && medal.earnedAt && (
                <span className={styles.medalDate}>
                  {new Date(medal.earnedAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {!medal.earned && (
                <span className={styles.medalLockIcon}>🔒</span>
              )}
            </m.div>
          ))}
        </m.div>
      </section>
    </div>
  )
}
