'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './error.module.css'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="sv">
      <body>
        <main className={styles.container} id="main-content">
          <div className={styles.content}>
            {/* Logo mark */}
            <div className={styles.logoMark} aria-hidden="true">
              <span className={styles.logoL}>L</span>
            </div>

            <h1 className={styles.heading}>Något gick fel</h1>
            <p className={styles.body}>
              Ett oväntat fel inträffade. Försök igen eller gå tillbaka till
              startsidan.
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
                Tillbaka till Lustre
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
