import Link from 'next/link'
import styles from './page.module.css'

/**
 * Default /discover route — Intentions dashboard.
 *
 * Intentions-based discovery (F29) is the primary flow. This page
 * presents a landing view with a clear call-to-action to either browse
 * profiles or create an Intention. Full Intention management is built in
 * the Intentions epic; this serves as the placeholder tab content.
 */
export default function DiscoverPage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.iconWrap} aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="var(--color-copper)" strokeWidth="2" strokeDasharray="4 2" />
            <path
              d="M24 14c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 8c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"
              fill="var(--color-copper)"
              opacity="0.8"
            />
            <path
              d="M32 22l2 2-6 6-3-3 2-2 1 1 4-4z"
              fill="var(--color-gold)"
            />
          </svg>
        </div>

        <h1 className={styles.heading}>Intentioner</h1>
        <p className={styles.description}>
          Berätta vad du letar efter — öka chansen att möta rätt person
          genom att skapa en intention som matchas mot andra.
        </p>

        <div className={styles.actions}>
          <Link href="/discover/browse" className={styles.primaryAction}>
            Bläddra profiler
          </Link>
          <Link href="/discover/search" className={styles.secondaryAction}>
            Sök med filter
          </Link>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>—</span>
          <span className={styles.statLabel}>Aktiva intentioner</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>—</span>
          <span className={styles.statLabel}>Nya matchningar idag</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>—</span>
          <span className={styles.statLabel}>Profiler nära dig</span>
        </div>
      </div>
    </div>
  )
}
