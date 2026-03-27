'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { m } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import ModuleCard from '@/components/learn/ModuleCard'
import StreakWidget from '@/components/learn/StreakWidget'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

interface Module {
  id: string
  order: number
  title: string
  description: string
  isSpicy: boolean
  isUnlocked: boolean
  badgeName?: string
  lessonCount: number
  completedLessons: number
  badgeEarned: boolean
}

interface Streak {
  currentStreak: number
  longestStreak: number
}

const MOCK_MODULES: Module[] = [
  {
    id: 'mod-1', order: 1, title: 'Övervinn rädslan', description: 'Lär dig att hantera nervositet och ta första steget mot ärliga samtal.',
    isSpicy: false, isUnlocked: true, badgeName: 'Modig start', lessonCount: 3, completedLessons: 3, badgeEarned: true,
  },
  {
    id: 'mod-2', order: 2, title: 'Aktiv lyssning', description: 'Förstå vad din partner egentligen menar och svara med empati.',
    isSpicy: false, isUnlocked: true, badgeName: 'Lyssnaren', lessonCount: 3, completedLessons: 1, badgeEarned: false,
  },
  {
    id: 'mod-3', order: 3, title: 'Tydlig kommunikation', description: 'Uttryck dina behov och önskemål på ett sätt som skapar trygghet.',
    isSpicy: false, isUnlocked: true, badgeName: 'Klarspråk', lessonCount: 4, completedLessons: 0, badgeEarned: false,
  },
  {
    id: 'mod-4', order: 4, title: 'Gränser och samtycke', description: 'Sätt och respektera gränser — grunden för all intim kontakt.',
    isSpicy: false, isUnlocked: false, badgeName: 'Gränsvakt', lessonCount: 3, completedLessons: 0, badgeEarned: false,
  },
  {
    id: 'mod-5', order: 5, title: 'Känslomässig närvaro', description: 'Var fullt närvarande och bygg djupare emotionell kontakt.',
    isSpicy: false, isUnlocked: false, badgeName: 'Hjärtnärvaro', lessonCount: 3, completedLessons: 0, badgeEarned: false,
  },
  {
    id: 'mod-101', order: 101, title: 'Samtycke som flirt', description: 'Gör samtyckesdialogen till en integrerad del av förspelet.',
    isSpicy: true, isUnlocked: false, badgeName: 'Samtyckesexpert', lessonCount: 3, completedLessons: 0, badgeEarned: false,
  },
  {
    id: 'mod-102', order: 102, title: 'Dirty talk — grunder', description: 'Hitta ord som känns naturliga och ökar spänningen.',
    isSpicy: true, isUnlocked: false, badgeName: 'Ordets kraft', lessonCount: 3, completedLessons: 0, badgeEarned: false,
  },
  {
    id: 'mod-103', order: 103, title: 'Dirty talk — avancerat', description: 'Bygg ett personligt språk för intimitet med din partner.',
    isSpicy: true, isUnlocked: false, badgeName: 'Mästaren', lessonCount: 3, completedLessons: 0, badgeEarned: false,
  },
]

const MOCK_STREAK: Streak = { currentStreak: 4, longestStreak: 12 }

export default function LearnPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [streak, setStreak] = useState<Streak>(MOCK_STREAK)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpicyEnabled, setIsSpicyEnabled] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [moduleResult, streakResult, modeResult] = await Promise.all([
          api.module.list.query(),
          api.gamification.getStreak.query(),
          api.settings.getMode.query(),
        ])
        setModules(moduleResult)
        setStreak({ currentStreak: streakResult.currentStreak, longestStreak: streakResult.longestStreak })
        setIsSpicyEnabled(modeResult.mode === 'spicy')
      } catch {
        setModules(MOCK_MODULES)
        setStreak(MOCK_STREAK)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const displayModules = isLoading ? MOCK_MODULES : modules
  const vanillaModules = displayModules.filter(m => !m.isSpicy)
  const spicyModules = displayModules.filter(m => m.isSpicy)

  return (
    <div className={styles.page}>
      <m.div
        className={styles.header}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={springs.soft}
      >
        <div className={styles.headerLeft}>
          <div className={styles.headingGroup}>
            <span className={styles.eyebrow}>Din resa</span>
            <h1 className={styles.heading}>Lärande</h1>
          </div>
          <p className={styles.subheading}>
            Bygg kommunikationsfärdigheter för djupare intimitet
          </p>
        </div>
        <div className={styles.headerRight}>
          <StreakWidget
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
          />
        </div>
      </m.div>

      {/* Sexuell hälsa card */}
      <m.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.05 }}
      >
        <Link href="/learn/sexual-health" className={styles.healthCard}>
          <div className={styles.healthIcon} aria-hidden="true">🩺</div>
          <div className={styles.healthBody}>
            <h3 className={styles.healthTitle}>Sexuell hälsa</h3>
            <p className={styles.healthDesc}>Artiklar, poddar och quiz om kropp, njutning och relationer</p>
          </div>
          <div className={styles.healthArrow} aria-hidden="true">→</div>
        </Link>
      </m.div>

      {/* Vanilla section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Moduler</span>
          <span className={styles.sectionBadge}>{vanillaModules.length} moduler</span>
        </div>

        <m.div
          className={styles.grid}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {vanillaModules.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              moduleId={mod.id}
              moduleNumber={mod.order}
              title={mod.title}
              description={mod.description}
              lessonCount={mod.lessonCount}
              completedLessons={mod.completedLessons}
              isLocked={!mod.isUnlocked}
              isSpicy={false}
              badgeName={mod.badgeName}
              badgeEarned={mod.badgeEarned}
              index={i}
            />
          ))}
        </m.div>
      </section>

      {/* Spicy section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>🌶️ Spicy — 18+</span>
          <span className={styles.sectionBadge}>{spicyModules.length} moduler</span>
        </div>

        {!isSpicyEnabled && (
          <m.div
            className={styles.spicyGate}
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ ...springs.soft, delay: 0.2 }}
          >
            <span className={styles.gateIcon}>🔒</span>
            <div className={styles.gateBody}>
              <h3 className={styles.gateTitle}>Spicy-läge är inte aktiverat</h3>
              <p className={styles.gateDesc}>
                Slutför modul 6 och aktivera Spicy-läge i inställningarna för att låsa upp avancerade kommunikationsmoduler.
              </p>
              <Link href="/settings/spicy" className={styles.gateAction}>
                Aktivera Spicy-läge
              </Link>
            </div>
          </m.div>
        )}

        {isSpicyEnabled && (
          <m.div
            className={styles.grid}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {spicyModules.map((mod, i) => (
              <ModuleCard
                key={mod.id}
                moduleId={mod.id}
                moduleNumber={mod.order}
                title={mod.title}
                description={mod.description}
                lessonCount={mod.lessonCount}
                completedLessons={mod.completedLessons}
                isLocked={!mod.isUnlocked}
                isSpicy={true}
                badgeName={mod.badgeName}
                badgeEarned={mod.badgeEarned}
                index={i}
              />
            ))}
          </m.div>
        )}
      </section>

      {/* Quick nav to achievements */}
      <m.div
        className={styles.achievementsLink}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.3 }}
      >
        <Link href="/learn/achievements" className={styles.achievementsCard}>
          <span className={styles.achievementsIcon}>🏆</span>
          <div>
            <h3 className={styles.achievementsTitle}>Dina prestationer</h3>
            <p className={styles.achievementsDesc}>Badges, medaljer och din streak-historia</p>
          </div>
          <span className={styles.achievementsArrow}>→</span>
        </Link>
      </m.div>
    </div>
  )
}
