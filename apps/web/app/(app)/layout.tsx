import { AppShell } from '@/components/layout/AppShell'
import { Header } from '@/components/layout/Header'
import { NavRail } from '@/components/layout/NavRail'
import { ContextPanel } from '@/components/layout/ContextPanel'
import { BottomNav } from '@/components/layout/BottomNav'
import { KeyboardShortcutsProvider } from '@/components/layout/KeyboardShortcutsProvider'
import { Providers } from './providers'
import { AuthGuard } from './auth-guard'
import styles from '@/components/layout/AppShell.module.css'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthGuard>
        <KeyboardShortcutsProvider>
          <AppShell>
            <Header />
            <NavRail />
            <main className={styles.main}>{children}</main>
            <ContextPanel>{null}</ContextPanel>
            <BottomNav />
          </AppShell>
        </KeyboardShortcutsProvider>
      </AuthGuard>
    </Providers>
  )
}
