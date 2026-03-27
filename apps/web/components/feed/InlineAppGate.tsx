'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import styles from './InlineAppGate.module.css'
import { getAppStoreLink } from '@/lib/app-store-links'
import { trackAppOnlyPromptImpression, trackAppOnlyPromptClick } from '@/lib/analytics'

interface InlineAppGateProps {
  contentType: 'spicy' | 'mature'
  icon?: string
}

export function InlineAppGate({ contentType = 'spicy', icon = '🔥' }: InlineAppGateProps) {
  useEffect(() => {
    trackAppOnlyPromptImpression(`inline_gate_${contentType}`)
  }, [contentType])

  const handleDownloadClick = () => {
    trackAppOnlyPromptClick(`inline_gate_${contentType}`, 'download')
  }

  return (
    <div className={styles.gate}>
      <div className={styles.icon}>{icon}</div>
      <p className={styles.text}>
        {contentType === 'spicy'
          ? 'Det här innehållet är bara tillgängligt i appen'
          : 'Det här innehållet kräver mobilappen'}
      </p>
      <Link href={getAppStoreLink()}>
        <Button size="sm" onClick={handleDownloadClick}>
          Visa i appen
        </Button>
      </Link>
    </div>
  )
}
