import { Children } from 'react'
import styles from './PolaroidMasonryGrid.module.css'

interface PolaroidMasonryGridProps {
  children: React.ReactNode
  className?: string
}

export default function PolaroidMasonryGrid({
  children,
  className,
}: PolaroidMasonryGridProps) {
  return (
    <div className={`${styles.grid} ${className ?? ''}`}>
      {Children.map(children, (child) => (
        <div className={styles.item}>{child}</div>
      ))}
    </div>
  )
}
