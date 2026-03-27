import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonImage } from '@/components/common/Skeleton'
import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.loading} aria-label="Laddar profil...">
      <SkeletonImage height={280} />
      <div className={styles.profileInfo}>
        <SkeletonCircle width={72} height={72} />
        <div className={styles.infoText}>
          <SkeletonText width="45%" height={24} />
          <SkeletonText width="30%" height={14} />
        </div>
      </div>
      <SkeletonText lines={3} height={16} />
      <div className={styles.tags}>
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonBox key={i} width={80} height={28} borderRadius={14} />
        ))}
      </div>
    </div>
  )
}
