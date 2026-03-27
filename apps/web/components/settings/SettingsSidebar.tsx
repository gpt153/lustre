'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './SettingsSidebar.module.css'

/* ---- Icons ---- */

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 16c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2L3 5v5c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="7" r="1" fill="currentColor" />
      <circle cx="12" cy="7" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9.5 3A7 7 0 1 0 15 8.5a5 5 0 0 1-5.5-5.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function ImportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2v10m0 0L6 9m3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function DeviceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 13v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2L1.5 15.5h15L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 8v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="13" r="0.75" fill="currentColor" />
    </svg>
  )
}

type IconKey = 'user' | 'shield' | 'palette' | 'moon' | 'import' | 'device' | 'warning'

const ICONS: Record<IconKey, (props: { className?: string }) => JSX.Element> = {
  user: UserIcon,
  shield: ShieldIcon,
  palette: PaletteIcon,
  moon: MoonIcon,
  import: ImportIcon,
  device: DeviceIcon,
  warning: WarningIcon,
}

/* ---- Sections ---- */

const SECTIONS = [
  { label: 'Konto', path: '/settings/account', icon: 'user' as IconKey },
  { label: 'Integritet', path: '/settings/privacy', icon: 'shield' as IconKey },
  { label: 'Läge', path: '/settings/mode', icon: 'palette' as IconKey },
  { label: 'Tema', path: '/settings/theme', icon: 'moon' as IconKey },
  { label: 'Migration', path: '/settings/migration', icon: 'import' as IconKey },
  { label: 'Sessioner', path: '/settings/sessions', icon: 'device' as IconKey },
]

const DANGER_SECTION = { label: 'Farozonen', path: '/settings/danger', icon: 'warning' as IconKey }

export default function SettingsSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function renderLink(
    section: { label: string; path: string; icon: IconKey },
    isDanger = false
  ) {
    const isActive = pathname != null && (pathname === section.path || pathname.startsWith(section.path + '/'))
    const Icon = ICONS[section.icon]

    const linkClass = [
      styles.link,
      isActive ? styles.linkActive : '',
      isDanger ? styles.linkDanger : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Link
        key={section.path}
        href={section.path}
        className={linkClass}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => setMobileOpen(false)}
      >
        <Icon className={styles.icon} />
        {section.label}
      </Link>
    )
  }

  return (
    <nav
      className={styles.sidebar}
      role="navigation"
      aria-label="Inställningar"
    >
      {/* Desktop title */}
      <span className={styles.sidebarTitle}>Inställningar</span>

      {/* Desktop nav */}
      <div className={styles.nav}>
        {SECTIONS.map((s) => renderLink(s))}
        <div className={styles.divider} />
        {renderLink(DANGER_SECTION, true)}
      </div>

      {/* Mobile header */}
      <div className={styles.mobileHeader}>
        <span className={styles.mobileTitle}>Inställningar</span>
        <button
          type="button"
          className={styles.hamburger}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Stäng meny' : 'Öppna meny'}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile nav */}
      <div className={[styles.mobileNav, mobileOpen ? styles.mobileNavOpen : ''].filter(Boolean).join(' ')}>
        {SECTIONS.map((s) => renderLink(s))}
        <div className={styles.divider} />
        {renderLink(DANGER_SECTION, true)}
      </div>
    </nav>
  )
}
