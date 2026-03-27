'use client'

import { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  variant?: 'elevated' | 'flat'
  className?: string
  onClick?: () => void
}

export function Card({
  children,
  variant = 'elevated',
  className = '',
  onClick,
}: CardProps) {
  const cardClass = [
    styles.card,
    variant === 'flat' && styles.cardFlat,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cardClass} onClick={onClick} role="region">
      {children}
    </div>
  )
}
