'use client'

import { useState } from 'react'
import { SettingsSection } from '../SettingsSection'
import { SettingRow } from '../SettingRow'
import { Toggle } from '../Toggle'
import { Button } from '@/components/common/Button'
import styles from './PrivacySection.module.css'

export function PrivacySection() {
  const [showOnDiscover, setShowOnDiscover] = useState(true)
  const [showDistance, setShowDistance] = useState(true)
  const [showOnlineStatus, setShowOnlineStatus] = useState(false)
  const [blockedCount, setBlockedCount] = useState(3)

  return (
    <SettingsSection
      title="Privacy Settings"
      description="Control who can see your profile and interact with you"
    >
      <SettingRow
        label="Show on Discover"
        description="Allow others to find your profile in discovery"
      >
        <Toggle
          id="discover-toggle"
          checked={showOnDiscover}
          onChange={setShowOnDiscover}
          label="Show on Discover"
        />
      </SettingRow>

      <SettingRow
        label="Show Distance"
        description="Display distance to other users"
      >
        <Toggle
          id="distance-toggle"
          checked={showDistance}
          onChange={setShowDistance}
          label="Show Distance"
        />
      </SettingRow>

      <SettingRow
        label="Show Online Status"
        description="Let others see when you're active"
      >
        <Toggle
          id="online-toggle"
          checked={showOnlineStatus}
          onChange={setShowOnlineStatus}
          label="Show Online Status"
        />
      </SettingRow>

      <SettingRow label="Blocked Users">
        <Button variant="secondary">{blockedCount} Blocked</Button>
      </SettingRow>

      <SettingRow label="Data Export">
        <Button variant="secondary">Request Data Export</Button>
      </SettingRow>
    </SettingsSection>
  )
}
