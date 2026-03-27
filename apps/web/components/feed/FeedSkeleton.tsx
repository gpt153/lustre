'use client'

import { SkeletonBox, SkeletonText, SkeletonCircle } from '@/components/common/Skeleton'
import styles from './FeedSkeleton.module.css'

function PostSkeletonItem() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.header}>
        <SkeletonCircle width={40} height={40} />
        <div className={styles.headerText}>
          <SkeletonText width={120} height={14} />
          <SkeletonText width={72} height={12} />
        </div>
      </div>
      <div className={styles.content}>
        <SkeletonText lines={3} height={14} />
      </div>
      <SkeletonBox className={styles.media} />
      <div className={styles.actions}>
        <SkeletonBox width={64} height={28} borderRadius={20} />
        <SkeletonBox width={64} height={28} borderRadius={20} />
      </div>
    </div>
  )
}

export default function FeedSkeleton() {
  return (
    <div className={styles.container} aria-label="Laddar flöde">
      <PostSkeletonItem />
      <PostSkeletonItem />
      <PostSkeletonItem />
    </div>
  )
}
