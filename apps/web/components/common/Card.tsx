import { ReactNode, HTMLAttributes } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  hoverable?: boolean
  className?: string
}

export default function Card({
  children,
  header,
  footer,
  hoverable = false,
  className,
  ...rest
}: CardProps) {
  const cardClass = [
    styles.card,
    hoverable ? styles.hoverable : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cardClass}
      tabIndex={hoverable ? 0 : undefined}
      role={hoverable ? 'button' : undefined}
      {...rest}
    >
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
