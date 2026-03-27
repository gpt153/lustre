'use client'

import Link from 'next/link'
import { m } from 'motion/react'
import { springs, slideUp } from '@/lib/motion'
import styles from './ModuleCard.module.css'

interface ModuleCardProps {
  moduleId: string | number
  moduleNumber: number | string
  title: string
  description: string
  lessonCount: number
  completedLessons: number
  isLocked?: boolean
  isSpicy?: boolean
  badgeName?: string
  badgeEarned?: boolean
  index?: number
}

export default function ModuleCard({
  moduleId,
  moduleNumber,
  title,
  description,
  lessonCount,
  completedLessons,
  isLocked = false,
  isSpicy = false,
  badgeName,
  badgeEarned = false,
  index = 0,
}: ModuleCardProps) {
  const progress = lessonCount > 0 ? (completedLessons / lessonCount) * 100 : 0
  const isComplete = completedLessons >= lessonCount && lessonCount > 0

  const content = (
    <m.div
      className={[styles.card, isLocked ? styles.locked : '', isSpicy ? styles.spicy : '', isComplete ? styles.complete : ''].filter(Boolean).join(' ')}
      variants={slideUp}
      initial="initial"
      animate="animate"
      transition={{ ...springs.soft, delay: index * 0.06 }}
      whileHover={!isLocked ? { y: -2, transition: springs.default } : undefined}
    >
      <div className={styles.header}>
        <div className={styles.numberBadge}>
          {isLocked ? (
            <span className={styles.lockIcon} aria-label="Låst">🔒</span>
          ) : (
            <span className={styles.number}>{moduleNumber}</span>
          )}
        </div>
        <div className={styles.meta}>
          {isSpicy && <span className={styles.spicyPill}>🌶️ 18+</span>}
          {badgeEarned && badgeName && (
            <span className={styles.badgePill} title={badgeName}>🏅 {badgeName}</span>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.lessonCount}>
          <span className={styles.lessonLabel}>LEKTIONER</span>
          <span className={styles.lessonValue}>{completedLessons}/{lessonCount}</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </m.div>
  )

  if (isLocked) {
    return <div className={styles.lockedWrapper}>{content}</div>
  }

  return (
    <Link href={`/learn/${moduleId}`} className={styles.link}>
      {content}
    </Link>
  )
}
