'use client'

import { m } from 'motion/react'
import { springs, scaleIn } from '@/lib/motion'
import styles from './AchievementBadge.module.css'

interface AchievementBadgeProps {
  name: string
  description?: string
  moduleOrder?: number
  earned?: boolean
  earnedAt?: string | null
  emoji?: string
  index?: number
  size?: 'sm' | 'md' | 'lg'
}

const MODULE_EMOJIS: Record<number, string> = {
  1: '🌱', 2: '💬', 3: '🧘', 4: '🎯', 5: '🤝',
  6: '⚡', 7: '🦁', 8: '🌊', 9: '💎', 10: '👑',
  101: '🔥', 102: '💋', 103: '🌶️', 104: '🎭', 105: '🌹',
  106: '⛓️', 107: '✨', 108: '🌙',
}

export default function AchievementBadge({
  name,
  description,
  moduleOrder,
  earned = false,
  earnedAt,
  emoji,
  index = 0,
  size = 'md',
}: AchievementBadgeProps) {
  const icon = emoji ?? (moduleOrder ? MODULE_EMOJIS[moduleOrder] : '🏅') ?? '🏅'

  const dateStr = earnedAt
    ? new Date(earnedAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <m.div
      className={[styles.badge, styles[size], earned ? styles.earned : styles.locked].join(' ')}
      variants={scaleIn}
      initial="initial"
      animate="animate"
      transition={{ ...springs.bouncy, delay: index * 0.04 }}
      title={description}
    >
      <div className={styles.iconWrap}>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
        {earned && <div className={styles.earnedGlow} aria-hidden="true" />}
        {!earned && <div className={styles.lockOverlay} aria-hidden="true">🔒</div>}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {earned && dateStr && <span className={styles.date}>{dateStr}</span>}
        {!earned && <span className={styles.lockedLabel}>Låst</span>}
      </div>
    </m.div>
  )
}
