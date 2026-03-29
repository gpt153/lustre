'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import PolaroidCard from '@/components/common/PolaroidCard'
import styles from './MatchModal.module.css'

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  onSendMessage?: () => void
  user1: { name: string; imageUrl: string }
  user2: { name: string; imageUrl: string }
}

export default function MatchModal({
  isOpen,
  onClose,
  onSendMessage,
  user1,
  user2,
}: MatchModalProps) {
  /* Delay applying the visible class so CSS transitions trigger */
  const [visible, setVisible] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      /* Force a layout frame before adding the class */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })
    } else {
      setVisible(false)
    }
  }, [isOpen])

  /* Escape key dismissal */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  /* Body scroll lock */
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.top = `-${scrollY}px`
      return () => {
        const top = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.top = ''
        window.scrollTo(0, parseInt(top || '0') * -1)
      }
    }
  }, [isOpen])

  /* Click backdrop to close */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  if (!isOpen) return null

  const overlayClass = [styles.overlay, visible ? styles.overlayVisible : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={overlayRef}
      className={overlayClass}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label="It's a connection!"
    >
      <div className={styles.modal}>
        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title */}
        <h2 className={styles.title}>It&apos;s a connection!</h2>

        {/* Two overlapping PolaroidCards */}
        <div className={styles.polaroidContainer}>
          <div className={styles.polaroidLeft}>
            <PolaroidCard
              imageUrl={user1.imageUrl}
              imageAlt={user1.name}
              caption={user1.name}
              rotation={0}
              hoverable={false}
            />
          </div>
          <div className={styles.polaroidRight}>
            <PolaroidCard
              imageUrl={user2.imageUrl}
              imageAlt={user2.name}
              caption={user2.name}
              rotation={0}
              hoverable={false}
            />
          </div>
        </div>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          You and {user2.name} both liked each other
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            onClick={onSendMessage}
            type="button"
          >
            Send a message
          </button>
          <button
            className={styles.secondaryButton}
            onClick={onClose}
            type="button"
          >
            Keep discovering
          </button>
        </div>

        {/* Decorative dots */}
        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.dotPrimary}`} />
          <span className={`${styles.dot} ${styles.dotSecondary}`} />
          <span className={`${styles.dot} ${styles.dotTertiary}`} />
        </div>
      </div>
    </div>
  )
}
