import styles from './AppShell.module.css'

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>{children}</div>
}
