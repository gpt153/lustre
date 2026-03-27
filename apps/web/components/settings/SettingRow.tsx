'use client'

import { ReactNode } from 'react'
import styles from './SettingRow.module.css'

interface SettingRowProps {
  label: string
  description?: string
  children: ReactNode
}

export function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingLabel}>
        <div className={styles.label}>{label}</div>
        {description && <div className={styles.description}>{description}</div>}
      </div>
      <div className={styles.settingControl}>{children}</div>
    </div>
  )
}
