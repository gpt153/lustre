'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './error.module.css'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AppError]', error)
  }, [error])

  return (
    <main className={styles.container} id="main-content" tabIndex={-1}>
      <div className={styles.content}>
        <div className={styles.logoMark} aria-hidden="true">
          <span className={styles.logoL}>L</span>
        </div>

        <h1 className={styles.heading}>Något gick fel</h1>
        <p className={styles.body}>
          Sidan kunde inte laddas korrekt. Försök igen eller navigera till en
          annan sida.
        </p>

        {error.digest && (
          <p className={styles.digest} aria-label={`Felkod: ${error.digest}`}>
            Referenskod: <code>{error.digest}</code>
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.retryButton}
            onClick={reset}
          >
            Försök igen
          </button>
          <Link href="/" className={styles.homeLink}>
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </main>
  )
}
