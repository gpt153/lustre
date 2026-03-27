'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import styles from './NavRail.module.css'

// ─── Icons ────────────────────────────────────────────────────────────────────

const CompassIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
  </svg>
)

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </svg>
)

const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const DotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="5" r="1.5"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="12" cy="19" r="1.5"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const GroupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)

const ShopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const GearIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItemDef {
  label: string
  path: string
  icon: React.ReactNode
  shortcut: string
}

interface SubItemDef {
  label: string
  path: string
  icon: React.ReactNode
}

// ─── Nav data ─────────────────────────────────────────────────────────────────

const mainItems: NavItemDef[] = [
  { label: 'Discover',  path: '/discover', icon: <CompassIcon />, shortcut: 'G D' },
  { label: 'Chat',      path: '/chat',     icon: <ChatIcon />,    shortcut: 'G C' },
  { label: 'Feed',      path: '/feed',     icon: <GridIcon />,    shortcut: 'G F' },
  { label: 'Profile',   path: '/profile',  icon: <PersonIcon />,  shortcut: 'G P' },
]

const moreItems: SubItemDef[] = [
  { label: 'Events',   path: '/events',   icon: <CalendarIcon /> },
  { label: 'Groups',   path: '/groups',   icon: <GroupIcon />    },
  { label: 'Learn',    path: '/learn',    icon: <BookIcon />     },
  { label: 'Shop',     path: '/shop',     icon: <ShopIcon />     },
  { label: 'Settings', path: '/settings', icon: <GearIcon />     },
]

// ─── NavItem component ────────────────────────────────────────────────────────

interface NavItemProps {
  item: NavItemDef
  isActive: boolean
}

function NavItem({ item, isActive }: NavItemProps) {
  return (
    <Link
      href={item.path}
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      aria-current={isActive ? 'page' : undefined}
      title={`${item.label} (${item.shortcut})`}
    >
      {isActive && <span className={styles.activeIndicator} aria-hidden="true" />}
      <span className={styles.icon}>{item.icon}</span>
      <span className={styles.label}>{item.label}</span>
      <span className={styles.shortcutHint} aria-hidden="true">{item.shortcut}</span>
    </Link>
  )
}

// ─── SubItem component ────────────────────────────────────────────────────────

interface SubItemProps {
  item: SubItemDef
  isActive: boolean
}

function SubItem({ item, isActive }: SubItemProps) {
  return (
    <Link
      href={item.path}
      className={`${styles.subItem} ${isActive ? styles.subItemActive : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={styles.icon}>{item.icon}</span>
      <span className={styles.label}>{item.label}</span>
    </Link>
  )
}

// ─── NavRail ──────────────────────────────────────────────────────────────────

export function NavRail() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreActive = moreItems.some(item => pathname === item.path || pathname?.startsWith(item.path + '/'))

  return (
    <nav className={styles.rail} aria-label="Huvudnavigation">
      {/* Logo */}
      <div className={styles.logo} aria-label="Lustre">
        <span className={styles.logoText}>L</span>
        <span className={styles.logoFull}>Lustre</span>
      </div>

      {/* Main nav items */}
      <div className={styles.items}>
        {mainItems.map(item => (
          <NavItem
            key={item.path}
            item={item}
            isActive={pathname === item.path || (pathname?.startsWith(item.path + '/') ?? false)}
          />
        ))}

        {/* More expandable */}
        <button
          className={`${styles.navItem} ${styles.moreButton} ${isMoreActive || moreOpen ? styles.navItemActive : ''}`}
          onClick={() => setMoreOpen(prev => !prev)}
          aria-expanded={moreOpen}
          aria-label="Mer navigation"
          title="Mer (M)"
        >
          {isMoreActive && !moreOpen && <span className={styles.activeIndicator} aria-hidden="true" />}
          <span className={styles.icon}><DotsIcon /></span>
          <span className={styles.label}>Mer</span>
          <span className={`${styles.chevron} ${moreOpen ? styles.chevronOpen : ''}`} aria-hidden="true">
            <ChevronDownIcon />
          </span>
        </button>

        {/* More submenu — inline expandable */}
        <div
          className={`${styles.moreMenu} ${moreOpen ? styles.moreMenuOpen : ''}`}
          aria-hidden={!moreOpen}
        >
          {moreItems.map(item => (
            <SubItem
              key={item.path}
              item={item}
              isActive={pathname === item.path || (pathname?.startsWith(item.path + '/') ?? false)}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}
