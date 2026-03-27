import Link from 'next/link'
import styles from '../../app/(landing)/page.module.css'

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Sex-positiv dejtingplattform
        </div>

        <h1 className={styles.heroTitle}>
          Dejta på{' '}
          <span className={styles.heroTitleGradient}>dina villkor</span>
        </h1>

        <p className={styles.heroSubtitle}>
          En plattform där varje möte är tryggt, varje meddelande är relevant,
          och du aldrig behöver tona ner dig. Med ConsentVault, SafeDate och AI-coach.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/register" className={styles.heroCtaPrimary}>
            Skapa konto
          </Link>
          <Link href="/login" className={styles.heroCtaSecondary}>
            Logga in
          </Link>
        </div>

        <div className={styles.heroAppBadges}>
          <span className={styles.appBadge}>
            <svg className={styles.appBadgeIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            App Store
          </span>
          <span className={styles.appBadge}>
            <svg className={styles.appBadgeIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3.18 23.76c.37.21.8.22 1.2.04l12.35-7.04-2.56-2.58-10.99 9.58zm-1.63-21.1C1.2 2.96 1 3.38 1 3.89v16.22c0 .51.2.93.55 1.23l.07.06 9.09-9.09v-.21L1.62 2.6l-.07.06zM20.1 10.5l-2.62-1.49-2.87 2.88 2.87 2.87 2.65-1.51c.76-.43.76-1.32-.03-1.75zm-18.4 11l10.99-9.59-2.57-2.56L1.7 19.2c.01 0 0 0 0 0z"/>
            </svg>
            Google Play
          </span>
        </div>
      </div>
    </section>
  )
}
