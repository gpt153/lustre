'use client'

import Link from 'next/link'
import { Button } from '@/components/common/Button'
import styles from './GroupCard.module.css'

interface GroupCardProps {
  group: {
    id: string
    name: string
    description: string | null
    category: string
    avatarUrl: string | null
    _count?: { members: number }
  }
}

export function GroupCard({ group }: GroupCardProps) {
  const memberCount = group._count?.members ?? 0

  return (
    <Link href={`/groups/${group.id}`} style={{ textDecoration: 'none' }}>
      <div className={styles.groupCard}>
        <div className={styles.groupHeader}>
          <div className={styles.groupAvatar}>👥</div>
          <div className={styles.groupInfo}>
            <h3 className={styles.groupName}>{group.name}</h3>
            <div className={styles.groupMeta}>
              <span className={styles.metaItem}>
                {memberCount} {memberCount === 1 ? 'medlem' : 'medlemmar'}
              </span>
            </div>
          </div>
        </div>

        <span className={styles.categoryTag}>{group.category}</span>

        <div className={styles.joinButton}>
          <Button variant="primary" size="md" type="button">
            Gå med
          </Button>
        </div>
      </div>
    </Link>
  )
}
