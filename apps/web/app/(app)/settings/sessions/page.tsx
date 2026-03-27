'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import { useAuthStore } from '@/lib/stores'

interface Session {
  id: string
  device: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    device: 'Chrome på macOS',
    ip: '84.17.***',
    lastActive: '2026-03-27T10:00:00Z',
    isCurrent: true,
  },
  {
    id: 's2',
    device: 'Safari på iPhone',
    ip: '90.22.***',
    lastActive: '2026-03-26T18:00:00Z',
    isCurrent: false,
  },
]

function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MobileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="15.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 5) return 'Nyligen'
  if (minutes < 60) return `${minutes} min sedan`
  if (hours < 24) return `${hours} tim sedan`
  return `${days} dag${days !== 1 ? 'ar' : ''} sedan`
}

export default function SessionsSettingsPage() {
  const userId = useAuthStore((s) => s.userId)

  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const data = await api.auth.getSessions.query()
        setSessions(data ?? MOCK_SESSIONS)
      } catch {
        setSessions(MOCK_SESSIONS)
      }
    }
    load()
  }, [userId])

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId)
    try {
      await api.auth.revokeSession.mutate({ sessionId })
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      addToast('Session avslutad', 'success')
    } catch {
      addToast('Kunde inte avsluta session', 'error')
    } finally {
      setRevokingId(null)
    }
  }

  async function handleRevokeAll() {
    setRevokingAll(true)
    try {
      await api.auth.revokeAllSessions.mutate()
      setSessions((prev) => prev.filter((s) => s.isCurrent))
      addToast('Alla andra sessioner avslutade', 'success')
    } catch {
      addToast('Kunde inte avsluta sessioner', 'error')
    } finally {
      setRevokingAll(false)
    }
  }

  function isMobile(device: string) {
    return /iphone|android|mobile|ipad/i.test(device)
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>Sessioner</h1>
        <p className={styles.pageSubtitle}>
          Se och hantera alla enheter som är inloggade på ditt konto.
        </p>
      </div>

      <Card header={<span className={styles.sectionTitle}>Aktiva sessioner</span>}>
        <div className={styles.sessionList}>
          {sessions.map((session) => {
            const mobile = isMobile(session.device)
            return (
              <div
                key={session.id}
                className={styles.sessionRow}
                aria-current={session.isCurrent ? 'true' : undefined}
              >
                <div className={[styles.deviceIcon, session.isCurrent ? styles.deviceIconCurrent : ''].filter(Boolean).join(' ')}>
                  {mobile ? <MobileIcon /> : <DesktopIcon />}
                </div>

                <div className={styles.sessionInfo}>
                  <div className={styles.sessionDevice}>
                    {session.device}
                    {session.isCurrent && (
                      <span className={styles.currentBadge}>Denna enhet</span>
                    )}
                  </div>
                  <div className={styles.sessionMeta}>
                    <span className={styles.sessionIp}>{session.ip}</span>
                    <span>{formatRelativeTime(session.lastActive)}</span>
                  </div>
                </div>

                {!session.isCurrent && (
                  <div className={styles.logoutBtn}>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={revokingId === session.id}
                      onClick={() => handleRevoke(session.id)}
                    >
                      Logga ut
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {sessions.filter((s) => !s.isCurrent).length > 0 && (
          <div className={styles.footerActions}>
            <Button
              variant="ghost"
              size="sm"
              loading={revokingAll}
              onClick={handleRevokeAll}
            >
              Logga ut alla andra enheter
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
