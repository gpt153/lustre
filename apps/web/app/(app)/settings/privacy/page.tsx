'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Toggle from '@/components/settings/Toggle'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import { useAuthStore } from '@/lib/stores'

function ShieldOffIcon() {
  return (
    <svg className={styles.emptyIcon} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 5L6 11v10c0 8.3 6 15.7 14 17.5 8-1.8 14-9.2 14-17.5V11L20 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15 20l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PrivacySettingsPage() {
  const userId = useAuthStore((s) => s.userId)

  const [readReceipts, setReadReceipts] = useState<boolean>(true)
  const [showOnlineStatus, setShowOnlineStatus] = useState<boolean>(true)
  const [showInSearch, setShowInSearch] = useState<boolean>(true)
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; displayName: string }>>([])
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const data = await api.settings.getPrivacy.query()
        if (data?.readReceipts !== undefined) setReadReceipts(data.readReceipts)
        if (data?.showOnlineStatus !== undefined) setShowOnlineStatus(data.showOnlineStatus)
        if (data?.showInSearch !== undefined) setShowInSearch(data.showInSearch)
      } catch {
        // use defaults
      }
      try {
        const blocked = await api.settings.getBlockedUsers.query()
        setBlockedUsers(blocked ?? [])
      } catch {
        setBlockedUsers([])
      }
    }
    load()
  }, [userId])

  async function handleToggle(key: 'readReceipts' | 'showOnlineStatus' | 'showInSearch', value: boolean) {
    const updates = { readReceipts, showOnlineStatus, showInSearch, [key]: value }

    if (key === 'readReceipts') setReadReceipts(value)
    if (key === 'showOnlineStatus') setShowOnlineStatus(value)
    if (key === 'showInSearch') setShowInSearch(value)

    try {
      await api.settings.updatePrivacy.mutate(updates)
      addToast('Integritetsinställningar sparade', 'success')
    } catch {
      addToast('Kunde inte spara inställningar', 'error')
    }
  }

  async function handleUnblock(userId: string) {
    setUnblockingId(userId)
    try {
      await api.settings.unblockUser.mutate({ userId })
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId))
      addToast('Användare avblockerad', 'success')
    } catch {
      addToast('Kunde inte avblockera', 'error')
    } finally {
      setUnblockingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>Integritet</h1>
        <p className={styles.pageSubtitle}>
          Styr vad andra kan se om dig och hur du syns på plattformen.
        </p>
      </div>

      {/* Privacy toggles */}
      <Card header={<span className={styles.sectionTitle}>Synlighet</span>}>
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ display: 'none' }}>Synlighetsinställningar</legend>
          <div className={styles.toggleList}>
            <div className={styles.toggleRow}>
              <Toggle
                label="Läskvittens"
                description="Visa när du har läst ett meddelande"
                value={readReceipts}
                onChange={(v) => handleToggle('readReceipts', v)}
              />
            </div>
            <div className={styles.toggleRow}>
              <Toggle
                label="Visa onlinestatus"
                description="Låt andra se när du är aktiv"
                value={showOnlineStatus}
                onChange={(v) => handleToggle('showOnlineStatus', v)}
              />
            </div>
            <div className={styles.toggleRow}>
              <Toggle
                label="Visa profil i sök"
                description="Tillåt att din profil visas i sökresultat"
                value={showInSearch}
                onChange={(v) => handleToggle('showInSearch', v)}
              />
            </div>
          </div>
        </fieldset>
      </Card>

      {/* Block list */}
      <Card header={<span className={styles.sectionTitle}>Blockerade användare</span>}>
        <div className={styles.blockList}>
          {blockedUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <ShieldOffIcon />
              <p className={styles.emptyText}>Inga blockerade användare</p>
            </div>
          ) : (
            blockedUsers.map((user) => (
              <div key={user.id} className={styles.blockedUser}>
                <span className={styles.blockedName}>{user.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={unblockingId === user.id}
                  onClick={() => handleUnblock(user.id)}
                >
                  Avblockera
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
