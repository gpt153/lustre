'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import styles from './CommandPalette.module.css'

interface CommandItem {
  label: string
  href: string
  shortcut: string
  section: string
}

const NAV_ITEMS: CommandItem[] = [
  { label: 'Discover', href: '/discover', shortcut: '1', section: 'Navigation' },
  { label: 'Connect (Chat)', href: '/chat', shortcut: '2', section: 'Navigation' },
  { label: 'Explore (Events)', href: '/events', shortcut: '3', section: 'Navigation' },
  { label: 'Learn', href: '/learn', shortcut: '4', section: 'Navigation' },
  { label: 'Profile', href: '/profile', shortcut: '5', section: 'Navigation' },
  { label: 'Settings', href: '/settings', shortcut: '', section: 'Navigation' },
  { label: 'Marketplace', href: '/shop', shortcut: '', section: 'Navigation' },
  { label: 'Groups', href: '/groups', shortcut: '', section: 'Navigation' },
]

const QUICK_ACTIONS: CommandItem[] = [
  { label: 'Show shortcuts', href: '#shortcuts', shortcut: '?', section: 'Quick Actions' },
  { label: 'Search', href: '#search', shortcut: '/', section: 'Quick Actions' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Debounce query to avoid excessive filtering
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(timer)
  }, [query])

  // Simple fuzzy search
  const filtered = useMemo(() => {
    if (!debouncedQuery) return NAV_ITEMS

    const q = debouncedQuery.toLowerCase()
    return NAV_ITEMS.filter(
      item => item.label.toLowerCase().includes(q)
    )
  }, [debouncedQuery])

  // Group results by section
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filtered.forEach(item => {
      if (!groups[item.section]) groups[item.section] = []
      groups[item.section].push(item)
    })
    return groups
  }, [filtered])

  const allItems = useMemo(() => {
    return Object.values(grouped).flat()
  }, [grouped])

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setActiveIndex(0)
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % allItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => (prev - 1 + allItems.length) % allItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = allItems[activeIndex]
        if (item) {
          selectItem(item)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, allItems, activeIndex, onClose])

  const selectItem = (item: CommandItem) => {
    onClose()
    router.push(item.href)
  }

  if (!isOpen) return null

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.palette}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search or jump to..."
          className={styles.searchInput}
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setActiveIndex(0)
          }}
          aria-label="Search commands"
        />

        {allItems.length === 0 ? (
          <div className={styles.emptyResults}>No results found</div>
        ) : (
          <div className={styles.results} role="listbox">
            {Object.entries(grouped).map(([section, items]) => (
              <div key={section}>
                <div className={styles.sectionLabel}>{section}</div>
                {items.map((item, i) => {
                  const globalIndex = allItems.indexOf(item)
                  return (
                    <button
                      key={item.href}
                      className={`${styles.resultItem} ${
                        globalIndex === activeIndex ? styles.resultItemActive : ''
                      }`}
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                      role="option"
                      aria-selected={globalIndex === activeIndex}
                    >
                      <span className={styles.resultIcon}>→</span>
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className={styles.shortcutHint}>{item.shortcut}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
