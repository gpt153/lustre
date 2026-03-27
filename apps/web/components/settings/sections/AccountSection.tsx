'use client'

import { useState } from 'react'
import { SettingsSection } from '../SettingsSection'
import { SettingRow } from '../SettingRow'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import styles from './AccountSection.module.css'

export function AccountSection() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  return (
    <>
      <SettingsSection
        title="Account Settings"
        description="Manage your account email, phone, and security"
      >
        <SettingRow
          label="Email Address"
          description="your.email@example.com"
        >
          <Button variant="secondary">Change</Button>
        </SettingRow>

        <SettingRow
          label="Phone Number"
          description="+46 701 234 567"
        >
          <Button variant="secondary">Update</Button>
        </SettingRow>

        <SettingRow
          label="Password"
          description="Last changed 3 months ago"
        >
          <Button variant="secondary">Change Password</Button>
        </SettingRow>

        <SettingRow
          label="Linked Accounts"
          description="Connect social accounts to your profile"
        >
          <div className={styles.linkedAccounts}>
            <div className={styles.linkedAccount}>
              <span>Google</span>
              <Button variant="ghost" className={styles.smallButton}>
                Connect
              </Button>
            </div>
            <div className={styles.linkedAccount}>
              <span>Apple</span>
              <Button variant="ghost" className={styles.smallButton}>
                Connect
              </Button>
            </div>
          </div>
        </SettingRow>

        <SettingRow label="Delete Account">
          <Button
            variant="primary"
            className={styles.deleteButton}
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </SettingRow>
      </SettingsSection>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
      >
        <div className={styles.deleteModal}>
          <p>
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <p className={styles.deleteWarning}>
            All your data including messages, photos, and matches will be permanently removed.
          </p>
          <div className={styles.deleteActions}>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className={styles.deleteConfirmButton}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
