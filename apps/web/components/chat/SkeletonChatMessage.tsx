import { Skeleton } from '@/components/common/Skeleton'
import styles from './SkeletonChatMessage.module.css'

export function SkeletonChatMessage({ width = '60%' }: { width?: string }) {
  return (
    <div className={styles.messageRow} aria-hidden="true">
      <Skeleton variant="circle" width={40} height={40} className={styles.avatar} />
      <div>
        <Skeleton width={width} height={36} className={styles.bubble} />
        <Skeleton width={60} height={12} className={styles.timestamp} />
      </div>
    </div>
  )
}
