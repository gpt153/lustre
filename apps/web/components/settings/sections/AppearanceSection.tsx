'use client'

import { useState } from 'react'
import { SettingsSection } from '../SettingsSection'
import { SettingRow } from '../SettingRow'
import { Toggle } from '../Toggle'
import { ThemeSwitch } from '@/components/common/ThemeSwitch'
import { ModeSwitch } from '@/components/common/ModeSwitch'

export function AppearanceSection() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  return (
    <SettingsSection
      title="Appearance Settings"
      description="Customize how the app looks and feels"
    >
      <SettingRow
        label="Theme"
        description="Choose between light and dark mode"
      >
        <ThemeSwitch />
      </SettingRow>

      <SettingRow
        label="Mode"
        description="Switch between vanilla and spicy content"
      >
        <ModeSwitch />
      </SettingRow>

      <SettingRow
        label="Sound Effects"
        description="Play sounds for notifications and interactions"
      >
        <Toggle
          id="sound-toggle"
          checked={soundEnabled}
          onChange={setSoundEnabled}
          label="Sound effects"
        />
      </SettingRow>

      <SettingRow
        label="Reduced Motion"
        description="Minimize animations and transitions"
      >
        <Toggle
          id="motion-toggle"
          checked={reducedMotion}
          onChange={setReducedMotion}
          label="Reduce motion"
        />
      </SettingRow>
    </SettingsSection>
  )
}
