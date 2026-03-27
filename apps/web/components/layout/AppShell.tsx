'use client'

import styles from './AppShell.module.css'
import { NavRail } from './NavRail'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
  contextPanel?: React.ReactNode
  showContextPanel?: boolean
}

export function AppShell({
  children,
  contextPanel,
  showContextPanel = true,
}: AppShellProps) {
  const hasContextContent = Boolean(contextPanel)
  const isContextVisible = showContextPanel && hasContextContent

  return (
    <div className={styles.shell}>
      <NavRail />
      <Header />

      <main id="main-content" className={styles.main} tabIndex={-1}>
        <div className={styles.mainInner}>
          {children}
        </div>
      </main>

      {hasContextContent && (
        <aside
          className={
            isContextVisible
              ? styles.contextPanel
              : `${styles.contextPanel} ${styles.contextPanelHidden}`
          }
          aria-label="Kontextpanel"
        >
          {contextPanel}
        </aside>
      )}

      <BottomNav />
    </div>
  )
}
