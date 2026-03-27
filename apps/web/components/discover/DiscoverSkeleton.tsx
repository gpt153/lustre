import { SkeletonBox, SkeletonText } from '@/components/common/Skeleton'
import styles from './DiscoverSkeleton.module.css'

const SKELETON_COUNT = 6

export default function DiscoverSkeleton() {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Laddar profiler...">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <div key={i} className={styles.card} aria-hidden="true">
          {/* Photo skeleton — 3:4 aspect ratio */}
          <SkeletonBox className={styles.photo} />

          {/* Body skeleton */}
          <div className={styles.body}>
            <SkeletonText width="60%" height={14} />
            <SkeletonText width="90%" height={12} />
            <SkeletonText width="75%" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}
