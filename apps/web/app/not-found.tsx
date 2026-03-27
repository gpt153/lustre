import Link from 'next/link'
import styles from './not-found.module.css'

export const metadata = {
  title: 'Sidan hittades inte — Lustre',
}

export default function NotFound() {
  return (
    <main className={styles.container} id="main-content">
      <div className={styles.content}>
        {/* Logo mark */}
        <div className={styles.logoMark} aria-hidden="true">
          <span className={styles.logoL}>L</span>
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>404</h1>
        <p className={styles.subheading}>Sidan hittades inte</p>
        <p className={styles.body}>
          Sidan du letar efter verkar ha försvunnit — precis som en bra
          matchning ibland gör. Kolla länken eller gå tillbaka till startsidan.
        </p>

        {/* CTA */}
        <Link href="/" className={styles.cta}>
          Tillbaka till Lustre
        </Link>
      </div>
    </main>
  )
}
