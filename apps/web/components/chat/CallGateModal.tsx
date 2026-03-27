'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import styles from './CallGateModal.module.css'
import { getAppStoreLink } from '@/lib/app-store-links'
import { trackAppOnlyPromptImpression, trackAppOnlyPromptClick } from '@/lib/analytics'

interface CallGateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CallGateModal({ isOpen, onClose }: CallGateModalProps) {
  useEffect(() => {
    if (isOpen) {
      trackAppOnlyPromptImpression('call')
    }
  }, [isOpen])

  const handleStoreClick = () => {
    trackAppOnlyPromptClick('call', 'store_click')
  }

  const handleClose = () => {
    trackAppOnlyPromptClick('call', 'close')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={styles.modalContent}>
        <div className={styles.icon}>☎️</div>
        <h2 className={styles.title}>Samtal görs i appen</h2>
        <p className={styles.description}>
          Video- och röstsamtal är optimerade för mobilappen där du har bäst anslutning och
          bildkvalitet.
        </p>

        <div className={styles.buttonGroup}>
          <Link href={getAppStoreLink()}>
            <Button onClick={handleStoreClick}>Ladda ner appen</Button>
          </Link>
          <Button variant="ghost" onClick={handleClose} className={styles.closeButton}>
            Avbryt
          </Button>
        </div>
      </div>
    </Modal>
  )
}
