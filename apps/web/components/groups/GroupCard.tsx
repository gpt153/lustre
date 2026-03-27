'use client'

import { m } from 'motion/react'
import { springs, slideUp } from '@/lib/motion'
import styles from './GroupCard.module.css'

export interface GroupCardData {
  id: string
  name: string
  description: string
  memberCount: number
  visibility: 'OPEN' | 'PRIVATE'
  imageUrl?: string
  tags?: string[]
  isJoined?: boolean
}

interface GroupCardProps {
  group: GroupCardData
  onClick?: (id: string) => void
}

export default function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <m.article
      className={styles.card}
      variants={slideUp}
      transition={springs.soft}
      onClick={() => onClick?.(group.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(group.id)
      }}
      aria-label={`Grupp: ${group.name}`}
      whileHover={{ y: -3, transition: springs.default }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar} aria-hidden="true">
          {group.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>{group.name}</h3>
          <div className={styles.meta}>
            <span className={styles.memberCount}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <circle cx="4.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 11c0-1.9 1.6-3.5 3.5-3.5S8 9.1 8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="9.5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M11 11c0-1.3-.8-2.4-2-2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {group.memberCount} medlemmar
            </span>
            <span className={`${styles.visibilityBadge} ${group.visibility === 'PRIVATE' ? styles.private : styles.open}`}>
              {group.visibility === 'PRIVATE' ? 'Privat' : 'Öppen'}
            </span>
          </div>
        </div>
        {group.isJoined && (
          <span className={styles.joinedBadge} aria-label="Du är med i denna grupp">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {/* Description */}
      <p className={styles.description}>{group.description}</p>

      {/* Tags */}
      {group.tags && group.tags.length > 0 && (
        <div className={styles.tags}>
          {group.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}
    </m.article>
  )
}
