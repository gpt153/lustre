'use client'

import Link from 'next/link'
import styles from './StitchNavRail.module.css'

// ─── SVG Icons (simple inline, no Material Symbols dependency) ───────────────

function CompassIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  )
}

function ChatBubbleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function FeedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 9a3 3 0 0 1 5.12 2.12c0 1.5-2.12 2.12-2.12 3.38" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// ─── Nav items configuration ─────────────────────────────────────────────────

type NavItemKey = 'discover' | 'messages' | 'feed' | 'profile'

interface NavItemConfig {
  key: NavItemKey
  label: string
  href: string
  icon: React.ComponentType
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'discover', label: 'Discover', href: '/discover', icon: CompassIcon },
  { key: 'messages', label: 'Messages', href: '/chat', icon: ChatBubbleIcon },
  { key: 'feed', label: 'Feed', href: '/feed', icon: FeedIcon },
  { key: 'profile', label: 'Profile', href: '/profile', icon: PersonIcon },
]

// ─── Component ───────────────────────────────────────────────────────────────

export interface StitchNavRailProps {
  /** Which nav item is currently active */
  activeItem?: NavItemKey
  /** User display name (shown at bottom) */
  userName?: string
  /** Callback when "+ New Entry" is clicked */
  onNewEntry?: () => void
  /** Optional className for the aside element */
  className?: string
}

export default function StitchNavRail({
  activeItem = 'feed',
  userName = 'Guest',
  onNewEntry,
  className,
}: StitchNavRailProps) {
  return (
    <aside
      className={`${styles.sidebar}${className ? ` ${className}` : ''}`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        Lustre
      </Link>

      {/* Tagline */}
      <p className={styles.tagline}>The Living Scrapbook</p>

      {/* Main navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.key
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.navItem}${isActive ? ` ${styles.navItemActive}` : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.navIcon}>
                <Icon />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          )
        })}

        {/* New Entry CTA */}
        <button
          type="button"
          className={styles.newEntry}
          onClick={onNewEntry}
          aria-label="Create new entry"
        >
          <PlusIcon />
          <span className={styles.newEntryLabel}>New Entry</span>
        </button>
      </nav>

      {/* Bottom section */}
      <div className={styles.bottom}>
        <Link href="/privacy" className={styles.bottomLink}>
          <span className={styles.bottomIcon}>
            <ShieldIcon />
          </span>
          <span>Privacy</span>
        </Link>
        <Link href="/help" className={styles.bottomLink}>
          <span className={styles.bottomIcon}>
            <HelpIcon />
          </span>
          <span>Help</span>
        </Link>

        {/* User info */}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <PersonIcon />
          </div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userBadge}>Premium Member</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
