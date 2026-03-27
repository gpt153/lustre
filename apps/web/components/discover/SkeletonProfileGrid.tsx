import { SkeletonCard } from '@/components/common/Skeleton'
import styles from './SkeletonProfileGrid.module.css'

export function SkeletonProfileGrid() {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Loading profiles">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
