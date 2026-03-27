'use client'

import styles from './SettingsSidebar.module.css'

export type Section = 'account' | 'privacy' | 'notifications' | 'appearance' | 'subscription' | 'help'

interface SettingsSidebarProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
}

const sidebarItems: { id: Section; label: string; icon: string }[] = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'subscription', label: 'Subscription', icon: '⭐' },
  { id: 'help', label: 'Help & Support', icon: '❓' },
]

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <aside className={styles.sidebar} role="navigation" aria-label="Settings sections">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          className={`${styles.sidebarItem} ${activeSection === item.id ? styles.sidebarItemActive : ''}`}
          onClick={() => onSectionChange(item.id)}
          aria-current={activeSection === item.id ? 'page' : undefined}
        >
          <span className={styles.icon} aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </aside>
  )
}
