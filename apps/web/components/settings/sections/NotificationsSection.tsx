'use client'

import { useState } from 'react'
import { SettingsSection } from '../SettingsSection'
import { SettingRow } from '../SettingRow'
import { Toggle } from '../Toggle'
import { Button } from '@/components/common/Button'

export function NotificationsSection() {
  const [emailMatches, setEmailMatches] = useState(true)
  const [emailMessages, setEmailMessages] = useState(true)
  const [emailEvents, setEmailEvents] = useState(false)
  const [emailMarketing, setEmailMarketing] = useState(false)

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification('Notifications enabled!', {
            body: 'You will now receive desktop notifications',
            icon: '🔔',
          })
        }
      } catch (error) {
        console.error('Notification permission error:', error)
      }
    }
  }

  return (
    <SettingsSection
      title="Notification Settings"
      description="Manage how and when you receive notifications"
    >
      <SettingRow
        label="Email: Matches"
        description="Receive email when you match with someone"
      >
        <Toggle
          id="email-matches"
          checked={emailMatches}
          onChange={setEmailMatches}
          label="Email notifications for matches"
        />
      </SettingRow>

      <SettingRow
        label="Email: Messages"
        description="Receive email when you get a new message"
      >
        <Toggle
          id="email-messages"
          checked={emailMessages}
          onChange={setEmailMessages}
          label="Email notifications for messages"
        />
      </SettingRow>

      <SettingRow
        label="Email: Events"
        description="Receive email about upcoming events near you"
      >
        <Toggle
          id="email-events"
          checked={emailEvents}
          onChange={setEmailEvents}
          label="Email notifications for events"
        />
      </SettingRow>

      <SettingRow
        label="Email: Marketing"
        description="Receive promotional updates about new features"
      >
        <Toggle
          id="email-marketing"
          checked={emailMarketing}
          onChange={setEmailMarketing}
          label="Email marketing notifications"
        />
      </SettingRow>

      <SettingRow label="Desktop Notifications">
        <Button variant="secondary" onClick={requestNotificationPermission}>
          Enable Desktop Notifications
        </Button>
      </SettingRow>
    </SettingsSection>
  )
}
