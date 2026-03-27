import { ReactNode } from 'react'
import SettingsSidebar from '@/components/settings/SettingsSidebar'
import styles from './layout.module.css'

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className={styles.container}>
      <SettingsSidebar />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
