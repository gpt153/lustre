import { Children } from 'react'
import styles from './PolaroidMasonryGrid.module.css'

interface PolaroidMasonryGridProps {
  children: React.ReactNode
  columns?: number
  gap?: string
  className?: string
}

export default function PolaroidMasonryGrid({
  children,
  columns,
  gap,
  className,
}: PolaroidMasonryGridProps) {
  const style: React.CSSProperties = {}
  if (columns !== undefined) {
    style.columnCount = columns
  }
  if (gap !== undefined) {
    style.columnGap = gap
  }

  return (
    <div className={`${styles.grid} ${className ?? ''}`} style={style}>
      {Children.map(children, (child) => (
        <div className={styles.item}>{child}</div>
      ))}
    </div>
  )
}
