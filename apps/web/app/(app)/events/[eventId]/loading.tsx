import { SkeletonBox, SkeletonText, SkeletonImage } from '@/components/common/Skeleton'
import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.loading} aria-label="Laddar evenemang...">
      <SkeletonImage height={240} />
      <div className={styles.content}>
        <SkeletonText width="60%" height={28} />
        <SkeletonText width="40%" height={16} />
        <SkeletonText lines={3} height={16} />
        <SkeletonBox height={44} width={160} />
      </div>
    </div>
  )
}
