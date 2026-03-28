'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from './SparkButton.module.css'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

interface SparkButtonProps {
  recipientId: string
  disabled?: boolean
  sparkedYou?: boolean
  onSuccess?: () => void
}

export default function SparkButton({
  recipientId,
  disabled = false,
  sparkedYou = false,
  onSuccess,
}: SparkButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Fetch spark balance
  useEffect(() => {
    async function loadBalance() {
      try {
        const data = await api.priority.getSparkBalance.query()
        setBalance(data.balance || 0)
      } catch {
        setBalance(0)
      }
    }
    loadBalance()
  }, [])

  const handleSendSpark = useCallback(async () => {
    if (disabled || balance === 0 || isLoading) return

    setIsLoading(true)
    try {
      const result = await api.priority.sendSpark.mutate({ recipientId })
      setBalance(result.balance || 0)
      setShowConfirmation(true)

      // Hide confirmation after 2 seconds
      setTimeout(() => setShowConfirmation(false), 2000)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to send spark:', error)
    } finally {
      setIsLoading(false)
    }
  }, [recipientId, disabled, balance, isLoading, onSuccess])

  const isDisabled = disabled || balance === 0 || isLoading

  return (
    <div className={styles.container}>
      <button
        className={[
          styles.actionBtn,
          styles.sparkBtn,
          isDisabled ? styles.disabled : '',
          showConfirmation ? styles.confirmed : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handleSendSpark}
        disabled={isDisabled}
        aria-label={`Skicka spark till användaren${balance === 0 ? ' (ingen spark tillgänglig)' : ''}`}
        tabIndex={-1}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {/* Lightning bolt SVG */}
          <path
            d="M10 2L5 10H8V18L15 10H12L10 2Z"
            fill="currentColor"
            strokeWidth="0.5"
            stroke="currentColor"
          />
        </svg>
      </button>

      {/* Spark balance badge */}
      {balance > 0 && (
        <div className={styles.badge} aria-label={`${balance} spark tillgänglig`}>
          {balance}
        </div>
      )}

      {/* "Sparked you" indicator */}
      {sparkedYou && (
        <div className={styles.sparkedYouIndicator} title="Skickade en spark till dig">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 2L5 10H8V18L15 10H12L10 2Z"
              fill="currentColor"
              strokeWidth="0.5"
              stroke="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
