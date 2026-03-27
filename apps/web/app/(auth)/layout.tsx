import styles from './layout.module.css'

interface AuthLayoutProps {
  children: React.ReactNode
}

/**
 * AuthLayout — Wraps /login and /register.
 *
 * No NavRail, no Header — just a full-screen dark canvas with
 * the content centered both axes. Copper ambient glow at the top.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.root}>
      <div className={styles.ambient} aria-hidden="true" />
      <main className={styles.main} id="main-content">
        {children}
      </main>
    </div>
  )
}
