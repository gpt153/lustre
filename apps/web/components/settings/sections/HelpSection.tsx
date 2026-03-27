'use client'

import { SettingsSection } from '../SettingsSection'
import { SettingRow } from '../SettingRow'
import { Button } from '@/components/common/Button'
import styles from './HelpSection.module.css'

interface HelpResource {
  title: string
  description: string
  url: string
}

export function HelpSection() {
  const helpResources: HelpResource[] = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using Lustre',
      url: '#',
    },
    {
      title: 'Safety Guidelines',
      description: 'Important information about staying safe on the platform',
      url: '#',
    },
    {
      title: 'Privacy Policy',
      description: 'Understand how we protect your data',
      url: '#',
    },
    {
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      url: '#',
    },
  ]

  return (
    <SettingsSection
      title="Help & Support"
      description="Get help and learn more about Lustre"
    >
      <SettingRow label="Contact Support">
        <Button variant="secondary">Email us</Button>
      </SettingRow>

      <div className={styles.resourcesSection}>
        <h3 className={styles.resourcesTitle}>Resources</h3>
        <div className={styles.resourcesList}>
          {helpResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              className={styles.resourceItem}
              onClick={(e) => {
                if (resource.url === '#') e.preventDefault()
              }}
            >
              <div className={styles.resourceContent}>
                <div className={styles.resourceTitle}>{resource.title}</div>
                <div className={styles.resourceDescription}>{resource.description}</div>
              </div>
              <span className={styles.resourceArrow} aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className={styles.appInfoSection}>
        <h3 className={styles.appInfoTitle}>App Information</h3>
        <div className={styles.infoItem}>
          <span>Version</span>
          <span>1.0.0</span>
        </div>
        <div className={styles.infoItem}>
          <span>Build</span>
          <span>20240327</span>
        </div>
        <div className={styles.infoItem}>
          <span>Last Updated</span>
          <span>March 27, 2024</span>
        </div>
      </div>
    </SettingsSection>
  )
}
