'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './layout.module.css'

const TABS = [
  { label: 'Intentioner', href: '/discover' },
  { label: 'Bläddra', href: '/discover/browse' },
  { label: 'Matchningar', href: '/discover/matches' },
  { label: 'Sök', href: '/discover/search' },
] as const

interface DiscoverLayoutProps {
  children: React.ReactNode
}

export default function DiscoverLayout({ children }: DiscoverLayoutProps) {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (!pathname) return false
    if (href === '/discover') {
      return pathname === '/discover'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={styles.container}>
      <nav className={styles.tabBar} role="tablist" aria-label="Discover-navigation">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive(tab.href)}
            className={[styles.tab, isActive(tab.href) ? styles.tabActive : ''].join(' ')}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className={styles.content}>{children}</div>
    </div>
  )
}
