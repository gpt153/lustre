'use client'

import Link from 'next/link'
import styles from './ModuleCard.module.css'

interface ModuleCardProps {
  id: string
  title: string
  description: string
  order: number
  isUnlocked: boolean
  isSpicy: boolean
  badgeName: string
  lessonCount: number
  progressPercent?: number
  isCompleted?: boolean
}

export function ModuleCard({
  id,
  title,
  description,
  order,
  isUnlocked,
  isSpicy,
  badgeName,
  lessonCount,
  progressPercent = 0,
  isCompleted = false,
}: ModuleCardProps) {
  const content = (
    <>
      {isSpicy && <div className={styles.spicyTag}>🌶️ 18+</div>}

      <div className={styles.header}>
        <div className={`${styles.badge} ${isUnlocked ? styles.badgeUnlocked : styles.badgeLocked}`}>
          {order}
        </div>
        <div style={{ flex: 1 }}>
          <h3 className={styles.title}>{title}</h3>
          {!isUnlocked && <p className={styles.lockedLabel}>🔒 Locked</p>}
        </div>
      </div>

      <p className={styles.description}>{description}</p>

      <div className={styles.tags}>
        <span className={styles.tag}>{lessonCount} lessons</span>
        <span className={styles.tag}>🏅 {badgeName}</span>
        {isCompleted && <span className={`${styles.tag} ${styles.completedBadge}`}>✓ {badgeName}</span>}
      </div>

      {progressPercent > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </>
  )

  if (!isUnlocked) {
    return (
      <div className={`${styles.moduleCard} ${styles.locked}`}>
        {content}
      </div>
    )
  }

  return (
    <Link href={`/learn/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={styles.moduleCard}>
        {content}
      </div>
    </Link>
  )
}
