'use client'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './ShortcutOverlay.module.css'

const SHORTCUTS = {
  Global: [
    { label: 'Command palette', key: 'Ctrl+K' },
    { label: 'Close modal/panel', key: 'Esc' },
    { label: 'Show shortcuts', key: '?' },
    { label: 'Focus search', key: '/' },
  ],
  Navigation: [
    { label: 'Discover', key: '1' },
    { label: 'Connect', key: '2' },
    { label: 'Explore', key: '3' },
    { label: 'Learn', key: '4' },
    { label: 'Profile', key: '5' },
  ],
  Discover: [
    { label: 'Like', key: 'L or →' },
    { label: 'Pass', key: 'P or ←' },
    { label: 'Super Like', key: 'S or ↑' },
    { label: 'Open profile', key: 'Enter' },
  ],
  Chat: [
    { label: 'Send message', key: 'Enter' },
    { label: 'New line', key: 'Shift+Enter' },
  ],
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutOverlay({ isOpen, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <div
        className={styles.content}
        onClick={e => e.stopPropagation()}
      >
        <h2 className={styles.title}>Keyboard Shortcuts</h2>

        {Object.entries(SHORTCUTS).map(([category, shortcuts]) => (
          <div key={category} className={styles.section}>
            <h3 className={styles.sectionTitle}>{category}</h3>
            {shortcuts.map(({ label, key }) => (
              <div key={label} className={styles.shortcutRow}>
                <span className={styles.shortcutLabel}>{label}</span>
                <kbd className={styles.shortcutKey}>{key}</kbd>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}
