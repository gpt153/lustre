'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { m } from 'motion/react'
import { springs, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import styles from './FeedAdCard.module.css'

interface FeedAdCardProps {
  campaignId: string
  creativeId: string
  sponsor: string
  headline: string
  body?: string
  imageUrl?: string
  ctaUrl: string
}

export default function FeedAdCard({
  campaignId,
  creativeId,
  sponsor,
  headline,
  body,
  imageUrl,
  ctaUrl,
}: FeedAdCardProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const impressionFiredRef = useRef(false)

  const recordImpression = useCallback(async () => {
    if (impressionFiredRef.current) return
    impressionFiredRef.current = true
    try {
      await api.ad.recordImpression.mutate({ campaignId, creativeId })
    } catch {
      // Silent — impression tracking is best-effort
    }
  }, [campaignId, creativeId])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          recordImpression()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [recordImpression])

  const handleCta = async () => {
    try {
      await api.ad.recordClick.mutate({ campaignId, creativeId })
    } catch {
      // Silent — click tracking is best-effort
    }
    if (ctaUrl.startsWith('/')) {
      router.push(ctaUrl)
    } else {
      window.open(ctaUrl, '_blank', 'noopener noreferrer')
    }
  }

  return (
    <m.div
      ref={containerRef}
      className={styles.card}
      variants={slideUp}
      initial="initial"
      animate="animate"
      transition={springs.soft}
      role="article"
      aria-label={`Sponsrat inlägg från ${sponsor}`}
    >
      <div className={styles.badge}>Sponsrad</div>

      <div className={styles.sponsorRow}>
        <div className={styles.sponsorAvatar} aria-hidden="true">
          {sponsor.charAt(0).toUpperCase()}
        </div>
        <span className={styles.sponsorName}>{sponsor}</span>
      </div>

      {imageUrl && (
        <div className={styles.imageWrap}>
          <img
            src={imageUrl}
            alt={headline}
            className={styles.image}
            loading="lazy"
          />
        </div>
      )}

      <div className={styles.content}>
        <h3 className={styles.headline}>{headline}</h3>
        {body && <p className={styles.body}>{body}</p>}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.ctaButton}
          onClick={handleCta}
          aria-label={`Läs mer om ${headline}`}
        >
          Läs mer
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </m.div>
  )
}
