'use client'

import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { logout } from '@/lib/auth'
import styles from './Header.module.css'

// ─── Icons ────────────────────────────────────────────────────────────────────

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const { toggleTheme, toggleMode, isSpicy, isDark } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={styles.header} role="banner">
      {/* Left — Logo */}
      <div className={styles.left}>
        <span className={`${styles.logoText} text-card-title`}>Lustre</span>
      </div>

      {/* Center — reserved for search */}
      <div className={styles.center} aria-hidden="true" />

      {/* Right — controls */}
      <div className={styles.right}>
        {/* Mode toggle: vanilla / spicy */}
        <button
          className={`${styles.toggleButton} ${isSpicy ? styles.toggleButtonSpicy : styles.toggleButtonVanilla}`}
          onClick={toggleMode}
          aria-label={isSpicy ? 'Byt till Vanilla-läge' : 'Byt till Spicy-läge'}
          title={isSpicy ? 'Byt till Vanilla (säkert läge)' : 'Byt till Spicy-läge'}
        >
          <span className={styles.toggleEmoji} aria-hidden="true">
            {isSpicy ? '🌶️' : '🌿'}
          </span>
          <span className={styles.toggleLabel}>
            {isSpicy ? 'Spicy' : 'Vanilla'}
          </span>
        </button>

        {/* Theme toggle: dark / light */}
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label={isDark ? 'Byt till ljust tema' : 'Byt till mörkt tema'}
          title={isDark ? 'Ljust tema' : 'Mörkt tema'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* User avatar + menu */}
        <div style={{ position: 'relative' }}>
          <button
            className={styles.avatarButton}
            aria-label="Användarmeny"
            title="Användarmeny"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className={styles.avatar} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: 'var(--color-surface, #fff)', borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: '4px 0',
              minWidth: 160, zIndex: 100,
            }}>
              <button
                onClick={() => { setMenuOpen(false); logout() }}
                style={{
                  display: 'block', width: '100%', padding: '10px 16px',
                  background: 'none', border: 'none', textAlign: 'left',
                  cursor: 'pointer', fontSize: 14, color: 'var(--color-text, #333)',
                }}
              >
                Logga ut
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
