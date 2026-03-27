'use client'

import { SkeletonBox, SkeletonText, SkeletonCircle } from '@/components/common/Skeleton'
import styles from './ProfileSkeleton.module.css'

export default function ProfileSkeleton() {
  return (
    <div className={styles.skeleton} aria-label="Laddar profil" aria-busy="true">
      {/* Header */}
      <div className={styles.header}>
        <SkeletonBox width="100%" height={320} borderRadius="var(--radius-xl)" />
        <div className={styles.headerMeta}>
          <SkeletonText width="60%" height={36} />
          <SkeletonText width="40%" height={20} />
          <div className={styles.headerBadges}>
            <SkeletonBox width={80} height={26} borderRadius="var(--radius-full)" />
            <SkeletonBox width={100} height={26} borderRadius="var(--radius-full)" />
          </div>
        </div>
      </div>

      {/* Photo grid */}
      <div className={styles.photoGrid}>
        <SkeletonBox className={styles.photoMain} height={280} borderRadius="var(--radius-lg)" />
        <SkeletonBox height={133} borderRadius="var(--radius-lg)" />
        <SkeletonBox height={133} borderRadius="var(--radius-lg)" />
      </div>

      {/* Bio */}
      <div className={styles.section}>
        <SkeletonText width="30%" height={14} />
        <div className={styles.bioLines}>
          <SkeletonText lines={3} />
        </div>
      </div>

      {/* Prompts */}
      <div className={styles.section}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.promptCard}>
            <SkeletonText width="50%" height={13} />
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>

      {/* Kudos */}
      <div className={styles.section}>
        <SkeletonText width="25%" height={14} />
        <div className={styles.kudosRow}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.kudosItem}>
              <SkeletonCircle width={48} height={48} />
              <SkeletonText width={40} height={12} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
