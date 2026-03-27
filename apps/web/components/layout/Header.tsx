'use client'

import { useAuthStore } from '@lustre/app'
import { LustreLogo } from '@lustre/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Header.module.css'

const NAV_LINKS = [
  { href: '/discover', label: 'Discover' },
  { href: '/chat', label: 'Connect' },
  { href: '/events', label: 'Explore' },
  { href: '/learn', label: 'Learn' },
]

export function Header() {
  const { logout, user } = useAuthStore()
  const pathname = usePathname()

  const handleLogout = async () => {
    logout()
  }

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <Link href="/discover">
          <LustreLogo width={32} height={32} />
        </Link>
      </div>

      <nav className={styles.navLinks}>
        {NAV_LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className={styles.rightSection}>
        <button className={styles.bellButton} title="Notifications">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2C6.69 2 4 4.69 4 8v5l-2 2v1h16v-1l-2-2v-5c0-3.31-2.69-6-6-6zm0 17c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"
              fill="currentColor"
            />
          </svg>
        </button>

        {user && (
          <div className={styles.avatarContainer}>
            <button
              className={styles.avatarButton}
              onClick={handleLogout}
              title={user.email || 'User menu'}
            >
              <div className={styles.avatar}>
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
