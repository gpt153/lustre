import { SkeletonBox, SkeletonText } from '@/components/common/Skeleton'
import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.loading} aria-label="Laddar modul...">
      <SkeletonText width="55%" height={32} />
      <SkeletonText lines={3} height={16} />
      <div className={styles.lessons}>
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonBox key={i} height={64} />
        ))}
      </div>
    </div>
  )
}
