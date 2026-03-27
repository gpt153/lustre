'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useId,
  KeyboardEvent,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import styles from './CommandPalette.module.css'

/* ============================================================
   Types
   ============================================================ */

export interface CommandItem {
  id: string
  label: string
  description?: string
  category: string
  icon?: ReactNode
  shortcut?: string
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  extraItems?: CommandItem[]
}

/* ============================================================
   Icons
   ============================================================ */

const NavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const ActionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 12l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const EmptySearchIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={styles.emptyIcon} aria-hidden="true">
    <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
    <path d="M27 27l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
  </svg>
)

/* ============================================================
   CommandPalette component
   ============================================================ */

export function CommandPalette({
  open,
  onClose,
  extraItems = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const router = useRouter()

  /* ---- Build default items ---- */

  const defaultItems: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-discover',
        label: 'Discover',
        description: 'Browse profiles and find matches',
        category: 'Navigation',
        icon: <NavIcon />,
        action: () => router.push('/discover'),
      },
      {
        id: 'nav-chat',
        label: 'Chat',
        description: 'Your conversations',
        category: 'Navigation',
        icon: <NavIcon />,
        action: () => router.push('/chat'),
      },
      {
        id: 'nav-feed',
        label: 'Feed',
        description: 'Community posts',
        category: 'Navigation',
        icon: <NavIcon />,
        action: () => router.push('/home'),
      },
      {
        id: 'nav-profile',
        label: 'Profile',
        description: 'Edit your profile',
        category: 'Navigation',
        icon: <NavIcon />,
        action: () => router.push('/profile'),
      },
      {
        id: 'nav-events',
        label: 'Events',
        description: 'Upcoming events near you',
        category: 'Navigation',
        icon: <NavIcon />,
        action: () => router.push('/events'),
      },
      {
        id: 'nav-groups',
        label: 'Groups',
        description: 'Community groups',
        category: 'Navigation',
        icon: <NavIcon />,
        action: () => router.push('/groups'),
      },
      {
        id: 'nav-learn',
        label: 'Learn',
        description: 'Coaching modules',
        category: 'Navigation',
        icon: <NavIcon />,
        action: () => router.push('/learn'),
      },
      {
        id: 'nav-shop',
        label: 'Shop',
        description: 'Partner products',
        category: 'Navigation',
        icon: <NavIcon />,
        action: () => router.push('/shop'),
      },
      {
        id: 'nav-settings',
        label: 'Settings',
        description: 'App preferences',
        category: 'Navigation',
        icon: <NavIcon />,
        shortcut: '⌘,',
        action: () => router.push('/settings'),
      },
      // Actions
      {
        id: 'action-toggle-theme',
        label: 'Toggle theme',
        description: 'Switch between light and dark',
        category: 'Actions',
        icon: <ActionIcon />,
        shortcut: '⌘⇧L',
        action: () => {
          const html = document.documentElement
          const current = html.getAttribute('data-theme') ?? 'dark'
          html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark')
        },
      },
      {
        id: 'action-toggle-mode',
        label: 'Toggle mode',
        description: 'Switch between Vanilla and Spicy',
        category: 'Actions',
        icon: <ActionIcon />,
        action: () => {
          const html = document.documentElement
          const current = html.getAttribute('data-mode') ?? 'vanilla'
          html.setAttribute('data-mode', current === 'vanilla' ? 'spicy' : 'vanilla')
        },
      },
      ...extraItems,
    ],
    [router, extraItems]
  )

  /* ---- Filter items by query ---- */

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return defaultItems
    return defaultItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [query, defaultItems])

  /* ---- Group by category ---- */

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    for (const item of filteredItems) {
      const existing = map.get(item.category) ?? []
      existing.push(item)
      map.set(item.category, existing)
    }
    return map
  }, [filteredItems])

  /* ---- Close with animation ---- */

  const close = useCallback(() => {
    setIsClosing(true)
    const overlayEl = document.querySelector(`.${styles.overlay}`)
    if (overlayEl) {
      overlayEl.addEventListener('animationend', () => {
        setIsClosing(false)
        setQuery('')
        setActiveIndex(0)
        onClose()
      }, { once: true })
      // Fallback
      setTimeout(() => {
        setIsClosing(false)
        setQuery('')
        setActiveIndex(0)
        onClose()
      }, 250)
    } else {
      setIsClosing(false)
      setQuery('')
      setActiveIndex(0)
      onClose()
    }
  }, [onClose])

  /* ---- Focus input when opened ---- */

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setIsClosing(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  /* ---- Keyboard navigation ---- */

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, filteredItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[activeIndex]) {
            filteredItems[activeIndex].action()
            close()
          }
          break
        case 'Escape':
          e.preventDefault()
          close()
          break
      }
    },
    [filteredItems, activeIndex, close]
  )

  /* ---- Scroll active item into view ---- */

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const activeEl = list.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open && !isClosing) return null

  const overlayClass = [styles.overlay, isClosing ? styles.closing : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={overlayClass}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        className={styles.panel}
        role="combobox"
        aria-expanded="true"
        aria-haspopup="listbox"
        aria-owns={listboxId}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className={styles.searchRow}>
          <SearchIcon />
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="text"
            placeholder="Sök kommandon..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            aria-label="Sök kommandon"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={
              filteredItems[activeIndex]
                ? `cmd-item-${filteredItems[activeIndex].id}`
                : undefined
            }
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className={styles.kbdHint}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} id={listboxId} className={styles.results} role="listbox">
          {filteredItems.length === 0 ? (
            <div className={styles.empty} role="status">
              <EmptySearchIcon />
              <p className={styles.emptyText}>
                Inga resultat för &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => {
              const startIndex = filteredItems.indexOf(items[0])
              return (
                <div key={category} className={styles.category}>
                  <p className={styles.categoryLabel}>{category}</p>
                  {items.map((item, localIdx) => {
                    const globalIdx = startIndex + localIdx
                    const isActive = globalIdx === activeIndex
                    return (
                      <button
                        key={item.id}
                        id={`cmd-item-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        data-index={globalIdx}
                        className={`${styles.item} ${isActive ? styles.active : ''}`}
                        onClick={() => {
                          item.action()
                          close()
                        }}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        type="button"
                      >
                        <span className={styles.itemIcon}>
                          {item.icon}
                        </span>
                        <span className={styles.itemText}>
                          <span className={styles.itemLabel}>{item.label}</span>
                          {item.description && (
                            <span className={styles.itemDescription}>
                              {item.description}
                            </span>
                          )}
                        </span>
                        {item.shortcut && (
                          <kbd className={styles.itemKbd}>{item.shortcut}</kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className={styles.footer} aria-hidden="true">
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>↑↓</kbd> navigera
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>↵</kbd> öppna
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>ESC</kbd> stäng
          </span>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   CommandPaletteWrapper
   Handles Cmd+K shortcut and lazy-loads the palette
   ============================================================ */

export function CommandPaletteWrapper() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const trigger = isMac ? e.metaKey : e.ctrlKey
      if (trigger && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <CommandPalette
      open={open}
      onClose={() => setOpen(false)}
    />
  )
}

export default CommandPalette
