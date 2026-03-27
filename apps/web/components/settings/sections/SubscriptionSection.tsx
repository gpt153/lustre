'use client'

import { SettingsSection } from '../SettingsSection'
import { SettingRow } from '../SettingRow'
import { Button } from '@/components/common/Button'
import styles from './SubscriptionSection.module.css'

interface BillingHistoryItem {
  date: string
  description: string
  amount: string
  status: 'completed' | 'pending' | 'failed'
}

export function SubscriptionSection() {
  const billingHistory: BillingHistoryItem[] = [
    {
      date: '2024-03-15',
      description: 'Token topup - 1000 tokens',
      amount: '99 SEK',
      status: 'completed',
    },
    {
      date: '2024-02-15',
      description: 'Token topup - 500 tokens',
      amount: '49 SEK',
      status: 'completed',
    },
    {
      date: '2024-01-15',
      description: 'Token topup - 500 tokens',
      amount: '49 SEK',
      status: 'completed',
    },
  ]

  return (
    <SettingsSection
      title="Subscription & Billing"
      description="Manage your plan and payment methods"
    >
      <SettingRow label="Current Plan">
        <div className={styles.planCard}>
          <div className={styles.planName}>Pay as you go</div>
          <div className={styles.planDescription}>
            Use tokens for premium features - no subscription required
          </div>
        </div>
      </SettingRow>

      <SettingRow label="Upgrade">
        <Button variant="primary">View Premium Options</Button>
      </SettingRow>

      <div className={styles.billingSection}>
        <h3 className={styles.billingTitle}>Billing History</h3>
        <div className={styles.billingTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}>Date</div>
            <div className={styles.tableCell}>Description</div>
            <div className={styles.tableCell}>Amount</div>
            <div className={styles.tableCell}>Status</div>
          </div>
          {billingHistory.map((item, index) => (
            <div key={index} className={styles.tableRow}>
              <div className={styles.tableCell}>
                {new Date(item.date).toLocaleDateString('sv-SE')}
              </div>
              <div className={styles.tableCell}>{item.description}</div>
              <div className={styles.tableCell}>{item.amount}</div>
              <div className={styles.tableCell}>
                <span className={`${styles.status} ${styles[item.status]}`}>
                  {item.status === 'completed'
                    ? 'Completed'
                    : item.status === 'pending'
                      ? 'Pending'
                      : 'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsSection>
  )
}
