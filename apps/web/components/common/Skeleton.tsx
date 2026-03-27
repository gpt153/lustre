import { CSSProperties } from 'react'
import styles from './Skeleton.module.css'

type SkeletonShape = 'box' | 'text' | 'circle' | 'image'

interface SkeletonProps {
  shape?: SkeletonShape
  width?: number | string
  height?: number | string
  borderRadius?: number | string
  className?: string
  /** Repeat N text lines (only meaningful when shape="text") */
  lines?: number
}

function toCSSValue(val: number | string | undefined): string | undefined {
  if (val === undefined) return undefined
  return typeof val === 'number' ? `${val}px` : val
}

/* ---- Individual skeleton element ---- */

function SkeletonEl({
  shape = 'box',
  width,
  height,
  borderRadius,
  className,
}: Omit<SkeletonProps, 'lines'>) {
  const style: CSSProperties = {}
  if (width !== undefined) style.width = toCSSValue(width)
  if (height !== undefined) style.height = toCSSValue(height)
  if (borderRadius !== undefined)
    style.borderRadius = toCSSValue(borderRadius)

  const cls = [styles.skeleton, styles[shape], className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cls}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  )
}

/* ---- Exported sub-components ---- */

export function SkeletonBox(props: Omit<SkeletonProps, 'shape' | 'lines'>) {
  return <SkeletonEl shape="box" {...props} />
}

export function SkeletonText({
  lines = 1,
  ...props
}: Omit<SkeletonProps, 'shape'>) {
  if (lines === 1) return <SkeletonEl shape="text" {...props} />
  return (
    <div aria-hidden="true" aria-label="Laddar...">
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonEl key={i} shape="text" {...props} />
      ))}
    </div>
  )
}

export function SkeletonCircle(props: Omit<SkeletonProps, 'shape' | 'lines'>) {
  return <SkeletonEl shape="circle" {...props} />
}

export function SkeletonImage(props: Omit<SkeletonProps, 'shape' | 'lines'>) {
  return <SkeletonEl shape="image" {...props} />
}

/* ---- Default export: generic Skeleton ---- */

export default function Skeleton({
  shape = 'box',
  lines,
  ...props
}: SkeletonProps) {
  if (shape === 'text' && lines && lines > 1) {
    return <SkeletonText lines={lines} {...props} />
  }
  return <SkeletonEl shape={shape} {...props} />
}
