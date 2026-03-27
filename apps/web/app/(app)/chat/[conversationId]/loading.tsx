import { SkeletonBox, SkeletonText, SkeletonCircle } from '@/components/common/Skeleton'
import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.loading} aria-label="Laddar konversation...">
      <div className={styles.chatHeader}>
        <SkeletonCircle width={40} height={40} />
        <SkeletonText width="35%" height={18} />
      </div>
      <div className={styles.messages}>
        <SkeletonBox height={44} width="60%" className={styles.messageRight} />
        <SkeletonBox height={44} width="50%" />
        <SkeletonBox height={56} width="70%" className={styles.messageRight} />
      </div>
      <SkeletonBox height={48} className={styles.inputBar} />
    </div>
  )
}
