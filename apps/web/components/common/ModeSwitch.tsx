'use client'

import styles from './ModeSwitch.module.css'
import { useTheme } from '@/hooks/useTheme'

export function ModeSwitch() {
  const { mode, setMode } = useTheme()
  const isSpicy = mode === 'spicy'

  return (
    <div
      className={styles.modeSwitch}
      role="group"
      aria-label="Välj läge"
    >
      {/* Sliding background indicator */}
      <div
        className={`${styles.slider} ${isSpicy ? styles.sliderSpicy : ''}`}
        aria-hidden="true"
      />

      {/* Vanilla option */}
      <button
        type="button"
        className={`${styles.option} ${!isSpicy ? styles.optionActive : ''}`}
        onClick={() => setMode('vanilla')}
        aria-pressed={!isSpicy}
        title="Vanilla-läge"
      >
        <span className={styles.optionIcon} aria-hidden="true">
          {/* Sage leaf */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7 1C4.5 1 2 3 2 6.5C2 9 4 12 7 13C10 12 12 9 12 6.5C12 3 9.5 1 7 1Z"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M7 3V13"
              stroke="var(--bg-primary)"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        Vanilla
      </button>

      {/* Spicy option */}
      <button
        type="button"
        className={`${styles.option} ${isSpicy ? styles.optionActive : ''}`}
        onClick={() => setMode('spicy')}
        aria-pressed={isSpicy}
        title="Spicy-läge"
      >
        <span className={styles.optionIcon} aria-hidden="true">
          {/* Ember flame */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7 1C7 1 5 4 5 6C5 6 4 5.5 4 4.5C3 5.5 2.5 6.5 2.5 8C2.5 10.5 4.5 13 7 13C9.5 13 11.5 10.5 11.5 8C11.5 5.5 9 3 7 1Z"
              fill="currentColor"
            />
            <path
              d="M7 8C7 8 6 9 6 9.5C6 10.3 6.45 11 7 11C7.55 11 8 10.3 8 9.5C8 9 7 8 7 8Z"
              fill="var(--bg-primary)"
              opacity="0.6"
            />
          </svg>
        </span>
        Spicy
      </button>
    </div>
  )
}
