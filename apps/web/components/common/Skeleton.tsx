import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circle' | 'rect'
  className?: string
}

export function Skeleton({ width, height, variant = 'rect', className = '' }: SkeletonProps) {
  const variantClass = variant === 'text' ? styles.skeletonText : variant === 'circle' ? styles.skeletonCircle : ''
  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className={`${styles.skeleton} ${styles.skeletonCard}`} aria-hidden="true">
      <div className={`${styles.skeleton} ${styles.skeletonCardImage}`} />
      <div className={styles.skeletonCardLines}>
        <div className={`${styles.skeleton} ${styles.skeletonCardLine1}`} />
        <div className={`${styles.skeleton} ${styles.skeletonCardLine2}`} />
        <div className={`${styles.skeleton} ${styles.skeletonCardButton}`} />
      </div>
    </div>
  )
}
