'use client'

import Link from 'next/link'
import { m } from 'motion/react'
import { springs, fadeIn } from '@/lib/motion'
import styles from './StreakWidget.module.css'

interface StreakWidgetProps {
  currentStreak: number
  longestStreak?: number
  compact?: boolean
}

export default function StreakWidget({ currentStreak, longestStreak, compact = false }: StreakWidgetProps) {
  const isOnFire = currentStreak >= 3

  return (
    <m.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={springs.soft}
    >
      <Link href="/learn/achievements" className={[styles.widget, compact ? styles.compact : ''].filter(Boolean).join(' ')}>
        <span className={[styles.fireEmoji, isOnFire ? styles.onFire : ''].filter(Boolean).join(' ')} aria-hidden="true">
          🔥
        </span>
        <div className={styles.textGroup}>
          <span className={styles.streakCount}>{currentStreak}</span>
          <span className={styles.streakLabel}>
            {compact ? 'd' : currentStreak === 1 ? 'dag' : 'dagar'}
          </span>
        </div>
        {!compact && longestStreak !== undefined && longestStreak > 0 && (
          <div className={styles.record}>
            <span className={styles.recordLabel}>Rekord</span>
            <span className={styles.recordValue}>{longestStreak}d</span>
          </div>
        )}
      </Link>
    </m.div>
  )
}
