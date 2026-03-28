'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './SpotlightActivate.module.css'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

interface SpotlightActivateProps {
  onActivated?: () => void
}

export default function SpotlightActivate({ onActivated }: SpotlightActivateProps) {
  const [credits, setCredits] = useState<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load spotlight credits and status
  useEffect(() => {
    async function loadSpotlightData() {
      try {
        const creditsData = await api.priority.getSpotlightCredits.query()
        setCredits(creditsData.credits || 0)

        const statusData = await api.priority.getSpotlightStatus.query()
        setIsActive(statusData.active || false)
        setRemainingSeconds(statusData.remainingSeconds || 0)
      } catch (err) {
        setError('Kunde inte hämta Spotlight-data')
        console.error('Failed to load spotlight data:', err)
      }
    }

    loadSpotlightData()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!isActive || remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, remainingSeconds])

  const handleActivateSpotlight = useCallback(async () => {
    if (isLoading || credits === 0 || isActive) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await api.priority.activateSpotlight.mutate()
      setIsActive(true)
      setRemainingSeconds(result.remainingSeconds || 0)
      setCredits((prev) => Math.max(0, prev - 1))

      if (onActivated) {
        onActivated()
      }
    } catch (err) {
      setError('Kunde inte aktivera Spotlight')
      console.error('Failed to activate spotlight:', err)
    } finally {
      setIsLoading(false)
    }
  }, [credits, isActive, isLoading, onActivated])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Spotlight</h3>
        <p className={styles.subtitle}>Visa din profil högre upp i sökresultat</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={[styles.card, isActive ? styles.active : ''].filter(Boolean).join(' ')}>
        {isActive ? (
          <div className={styles.activeContent}>
            <div className={styles.pulseIndicator} aria-hidden="true" />
            <div className={styles.statusLabel}>Spotlight är aktiv</div>
            <div className={styles.countdown}>{formatTime(remainingSeconds)}</div>
            <p className={styles.statusText}>Din profil är synlig för fler användare</p>
          </div>
        ) : (
          <div className={styles.inactiveContent}>
            <div className={styles.creditsDisplay}>
              <span className={styles.creditsLabel}>Tillgängliga krediter:</span>
              <span className={styles.creditsValue}>{credits}</span>
            </div>

            <button
              className={[styles.activateBtn, credits === 0 ? styles.disabled : ''].filter(Boolean).join(' ')}
              onClick={handleActivateSpotlight}
              disabled={credits === 0 || isLoading}
              aria-label={
                credits === 0
                  ? 'Inga Spotlight-krediter tillgängliga'
                  : 'Aktivera Spotlight för din profil'
              }
            >
              {isLoading ? 'Aktiverar...' : 'Aktivera Spotlight'}
            </button>

            {credits === 0 && (
              <p className={styles.noCreditsMessage}>
                Du har inga Spotlight-krediter. Tjäna krediter genom milstolpar.
              </p>
            )}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.infoText}>
          När Spotlight är aktivt visas din profil högre upp i andra användares sökresultat i 30 minuter.
        </p>
      </div>
    </div>
  )
}
