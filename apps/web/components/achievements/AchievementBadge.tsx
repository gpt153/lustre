'use client'

import { useState } from 'react'
import styles from './AchievementBadge.module.css'

interface AchievementBadgeProps {
  icon: string
  name: string
  description: string
  isUnlocked: boolean
}

export function AchievementBadge({
  icon,
  name,
  description,
  isUnlocked,
}: AchievementBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className={styles.badge}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`${styles.badgeIcon} ${isUnlocked ? styles.badgeUnlocked : styles.badgeLocked}`}>
        {icon}
        {!isUnlocked && (
          <div className={styles.lockIcon}>
            🔒
          </div>
        )}
      </div>
      <div className={styles.badgeName}>{name}</div>
      {showTooltip && <div className={styles.tooltip}>{description}</div>}
    </div>
  )
}
