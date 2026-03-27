'use client'

import { ReactNode } from 'react'
import styles from './AuthCard.module.css'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className={styles.authCard}>
      <h1 className={styles.authTitle}>{title}</h1>
      {subtitle && <p className={styles.authSubtitle}>{subtitle}</p>}
      {children}
    </div>
  )
}
