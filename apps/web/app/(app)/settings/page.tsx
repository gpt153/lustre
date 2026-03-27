'use client'

import { useState } from 'react'
import { SettingsSidebar } from '@/components/settings/SettingsSidebar'
import { AccountSection } from '@/components/settings/sections/AccountSection'
import { PrivacySection } from '@/components/settings/sections/PrivacySection'
import { NotificationsSection } from '@/components/settings/sections/NotificationsSection'
import { AppearanceSection } from '@/components/settings/sections/AppearanceSection'
import { SubscriptionSection } from '@/components/settings/sections/SubscriptionSection'
import { HelpSection } from '@/components/settings/sections/HelpSection'
import styles from './page.module.css'

type Section = 'account' | 'privacy' | 'notifications' | 'appearance' | 'subscription' | 'help'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('account')

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSection />
      case 'privacy':
        return <PrivacySection />
      case 'notifications':
        return <NotificationsSection />
      case 'appearance':
        return <AppearanceSection />
      case 'subscription':
        return <SubscriptionSection />
      case 'help':
        return <HelpSection />
      default:
        return <AccountSection />
    }
  }

  return (
    <div className={styles.container}>
      <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className={styles.content}>
        {renderSection()}
      </div>
    </div>
  )
}
