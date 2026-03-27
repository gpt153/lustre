'use client'

import { useState, useEffect, useCallback } from 'react'
import { m } from 'motion/react'
import { springs, slideUp, staggerContainer, fadeIn } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

interface InviteLink {
  id: string
  code: string
  url: string
  createdAt: string
  claimedBy?: string
  claimedAt?: string
}

const MOCK_INVITES: InviteLink[] = [
  {
    id: 'inv1',
    code: 'lstr-abc1',
    url: 'https://lovelustre.com/invite/lstr-abc1',
    createdAt: '2026-03-20T10:00:00Z',
    claimedBy: 'Emma K.',
    claimedAt: '2026-03-22T14:33:00Z',
  },
  {
    id: 'inv2',
    code: 'lstr-xyz9',
    url: 'https://lovelustre.com/invite/lstr-xyz9',
    createdAt: '2026-03-25T09:15:00Z',
  },
  {
    id: 'inv3',
    code: 'lstr-m8qr',
    url: 'https://lovelustre.com/invite/lstr-m8qr',
    createdAt: '2026-03-26T18:45:00Z',
    claimedBy: 'Alex N.',
    claimedAt: '2026-03-27T07:20:00Z',
  },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function InvitePage() {
  const [invites, setInvites] = useState<InviteLink[]>([])
  const [activeLink, setActiveLink] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [totalTokens, setTotalTokens] = useState(0)

  const loadInvites = useCallback(async () => {
    try {
      const result = await api.invite.getMyLinks.query()
      setInvites(result?.length ? result : MOCK_INVITES)
      const rewards = await api.invite.getRewards.query()
      setTotalTokens(rewards?.totalTokens ?? 300)
    } catch {
      setInvites(MOCK_INVITES)
      setTotalTokens(300)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvites()
  }, [loadInvites])

  const generateLink = async () => {
    setIsGenerating(true)
    try {
      const result = await api.invite.generate.mutate()
      const newInvite: InviteLink = {
        id: result?.id ?? `inv-${Date.now()}`,
        code: result?.code ?? `lstr-${Math.random().toString(36).slice(2, 6)}`,
        url: result?.url ?? `https://lovelustre.com/invite/${result?.code ?? 'new'}`,
        createdAt: new Date().toISOString(),
      }
      setInvites((prev) => [newInvite, ...prev])
      setActiveLink(newInvite.url)
    } catch {
      const code = `lstr-${Math.random().toString(36).slice(2, 6)}`
      const newInvite: InviteLink = {
        id: `inv-${Date.now()}`,
        code,
        url: `https://lovelustre.com/invite/${code}`,
        createdAt: new Date().toISOString(),
      }
      setInvites((prev) => [newInvite, ...prev])
      setActiveLink(newInvite.url)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  const displayLink = activeLink || invites[0]?.url || ''
  const claimed = invites.filter((i) => i.claimedBy).length

  return (
    <div className={styles.page}>
      <m.header
        className={styles.header}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={springs.soft}
      >
        <h1 className={styles.heading}>Bjud in vänner</h1>
        <p className={styles.subheading}>Dela Lustre med dina vänner och tjäna tokens</p>
      </m.header>

      {/* Rewards banner */}
      <m.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.08 }}
      >
        <Card className={styles.rewardsCard}>
          <div className={styles.rewardsGrid}>
            <div className={styles.rewardItem}>
              <span className={styles.rewardIcon} aria-hidden="true">🎁</span>
              <div>
                <p className={styles.rewardValue}>100 tokens</p>
                <p className={styles.rewardLabel}>Du får per inbjudan</p>
              </div>
            </div>
            <div className={styles.rewardDivider} aria-hidden="true" />
            <div className={styles.rewardItem}>
              <span className={styles.rewardIcon} aria-hidden="true">⭐</span>
              <div>
                <p className={styles.rewardValue}>50 tokens</p>
                <p className={styles.rewardLabel}>Din vän får vid registrering</p>
              </div>
            </div>
            <div className={styles.rewardDivider} aria-hidden="true" />
            <div className={styles.rewardItem}>
              <span className={styles.rewardIcon} aria-hidden="true">💎</span>
              <div>
                <p className={styles.rewardValue}>{isLoading ? '—' : totalTokens}</p>
                <p className={styles.rewardLabel}>Totalt intjänat</p>
              </div>
            </div>
          </div>
        </Card>
      </m.div>

      {/* Generate & share */}
      <m.div
        className={styles.shareSection}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.14 }}
      >
        <h2 className={styles.sectionTitle}>Din inbjudningslänk</h2>

        <div className={styles.linkRow}>
          <div className={styles.linkInputWrapper}>
            <Input
              type="url"
              value={displayLink}
              readOnly
              placeholder="Generera en länk nedan…"
              aria-label="Inbjudningslänk"
              className={styles.linkInput}
            />
          </div>
          <Button
            variant={copied ? 'secondary' : 'primary'}
            size="md"
            onClick={() => displayLink && copyLink(displayLink)}
            disabled={!displayLink}
            className={styles.copyButton}
            aria-live="polite"
          >
            {copied ? 'Kopierad!' : 'Kopiera'}
          </Button>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={generateLink}
          loading={isGenerating}
          className={styles.generateButton}
        >
          + Generera ny länk
        </Button>
      </m.div>

      {/* History */}
      <m.div
        className={styles.historySection}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <h2 className={styles.sectionTitle}>
          Mina inbjudningar
          {claimed > 0 && (
            <span className={styles.claimedBadge}>{claimed} accepterade</span>
          )}
        </h2>

        {isLoading ? (
          <div className={styles.historyEmpty}>
            <p className={styles.historyEmptyText}>Laddar…</p>
          </div>
        ) : invites.length === 0 ? (
          <m.div
            className={styles.historyEmpty}
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <p className={styles.historyEmptyText}>Du har inte bjudit in någon ännu.</p>
          </m.div>
        ) : (
          <div className={styles.historyList} role="list">
            {invites.map((invite) => (
              <m.div
                key={invite.id}
                className={styles.historyItem}
                variants={slideUp}
                transition={springs.soft}
                role="listitem"
              >
                <div className={styles.historyItemLeft}>
                  <span className={styles.historyCode}>{invite.code}</span>
                  <span className={styles.historyDate}>Skapad {formatDate(invite.createdAt)}</span>
                </div>
                <div className={styles.historyItemRight}>
                  {invite.claimedBy ? (
                    <span className={styles.statusAccepted}>
                      ✓ {invite.claimedBy}
                    </span>
                  ) : (
                    <span className={styles.statusPending}>Inväntar</span>
                  )}
                  <button
                    type="button"
                    className={styles.copySmall}
                    onClick={() => copyLink(invite.url)}
                    aria-label={`Kopiera länk ${invite.code}`}
                  >
                    Kopiera
                  </button>
                </div>
              </m.div>
            ))}
          </div>
        )}
      </m.div>
    </div>
  )
}
