'use client'

import Link from 'next/link'
import styles from './KudosSection.module.css'

interface KudosBadge {
  badgeId: string
  badgeName: string
  emoji: string
  count: number
}

interface KudosSectionProps {
  kudos: KudosBadge[]
  userId?: string
  canGive?: boolean
}

export default function KudosSection({ kudos, userId, canGive = false }: KudosSectionProps) {
  if (kudos.length === 0 && !canGive) return null

  const sorted = [...kudos].sort((a, b) => b.count - a.count)

  return (
    <section className={styles.section} aria-labelledby="kudos-heading">
      <h2 className={styles.heading} id="kudos-heading">
        Kudos
      </h2>

      {sorted.length > 0 ? (
        <div className={styles.badgeRow} role="list">
          {sorted.map((badge) => {
            const isHighCount = badge.count > 5
            return (
              <div
                key={badge.badgeId}
                className={`${styles.badge} ${isHighCount ? styles.badgeHigh : ''}`}
                role="listitem"
                title={badge.badgeName}
              >
                <span className={styles.emoji} aria-hidden="true">
                  {badge.emoji}
                </span>
                <span className={styles.count} aria-label={`${badge.count} ${badge.badgeName}`}>
                  {badge.count}
                </span>
                <span className={styles.badgeName}>{badge.badgeName}</span>
              </div>
            )
          })}

          {canGive && userId && (
            <Link
              href={`/kudos/give/${userId}`}
              className={styles.giveLink}
              aria-label="Ge kudos till den här personen"
            >
              <span className={styles.givePlusIcon} aria-hidden="true">+</span>
              <span>Ge kudos</span>
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Inga kudos ännu.</p>
          {canGive && userId && (
            <Link href={`/kudos/give/${userId}`} className={styles.giveLink}>
              <span className={styles.givePlusIcon} aria-hidden="true">+</span>
              <span>Ge kudos</span>
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
