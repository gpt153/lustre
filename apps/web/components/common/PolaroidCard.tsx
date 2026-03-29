import styles from './PolaroidCard.module.css'

interface PolaroidCardProps {
  imageUrl: string
  imageAlt: string
  caption?: string
  rotation?: number
  stack?: boolean
  hoverable?: boolean
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

export default function PolaroidCard({
  imageUrl,
  imageAlt,
  caption,
  rotation = 0,
  stack = false,
  hoverable = true,
  className,
  children,
  onClick,
}: PolaroidCardProps) {
  const cardClasses = [
    styles.card,
    stack ? styles.stack : '',
    hoverable ? styles.hoverable : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cardClasses}
      style={{ '--polaroid-rotation': `${rotation}deg` } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className={styles.topBorder} />
      <img
        src={imageUrl}
        alt={imageAlt}
        className={styles.image}
        loading="lazy"
      />
      <div className={styles.captionArea}>
        {caption && <span className={styles.caption}>{caption}</span>}
        {children && <div className={styles.children}>{children}</div>}
      </div>
    </div>
  )
}
