import { SkeletonBox, SkeletonText, SkeletonImage } from '@/components/common/Skeleton'
import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.loading} aria-label="Laddar produkt...">
      <SkeletonImage height={320} />
      <div className={styles.content}>
        <SkeletonText width="70%" height={28} />
        <SkeletonText width="30%" height={20} />
        <SkeletonText lines={3} height={16} />
        <SkeletonBox height={48} />
      </div>
    </div>
  )
}
