'use client'

import { useState, useEffect } from 'react'
import styles from './ContextPanel.module.css'

interface ContextPanelProps {
  children: React.ReactNode
}

export function ContextPanel({ children }: ContextPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <aside className={styles.contextPanel}>
      <button
        className={styles.closeButton}
        onClick={() => setIsOpen(false)}
        aria-label="Close context panel"
        title="Close"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 2L14 14M14 2L2 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div className={styles.content}>{children}</div>
    </aside>
  )
}
