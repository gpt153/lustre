import { SkeletonBox, SkeletonText, SkeletonCircle } from '@/components/common/Skeleton'
import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.loading} aria-label="Laddar grupp...">
      <div className={styles.header}>
        <SkeletonCircle width={64} height={64} />
        <div className={styles.headerText}>
          <SkeletonText width="50%" height={24} />
          <SkeletonText width="30%" height={14} />
        </div>
      </div>
      <SkeletonText lines={3} height={16} />
      <SkeletonBox height={44} width={140} />
    </div>
  )
}
