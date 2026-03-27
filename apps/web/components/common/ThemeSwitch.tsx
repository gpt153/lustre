'use client'

import styles from './ThemeSwitch.module.css'
import { useTheme } from '@/hooks/useTheme'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const toggle = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <button
      type="button"
      className={styles.themeSwitch}
      onClick={toggle}
      aria-label={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
      title={isDark ? 'Ljust läge' : 'Mörkt läge'}
    >
      {isDark ? (
        // Sun icon (shown in dark mode to switch to light)
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="4" fill="currentColor" />
          <line x1="9" y1="1" x2="9" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="1" y1="9" x2="3" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3.05" y1="3.05" x2="4.46" y2="4.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13.54" y1="13.54" x2="14.95" y2="14.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14.95" y1="3.05" x2="13.54" y2="4.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4.46" y1="13.54" x2="3.05" y2="14.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : (
        // Moon icon (shown in light mode to switch to dark)
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M15.5 10.5A7 7 0 017.5 2.5a6.5 6.5 0 100 13 6.5 6.5 0 008-5z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  )
}
