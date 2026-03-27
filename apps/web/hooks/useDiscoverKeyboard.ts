'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseDiscoverKeyboardOptions {
  totalCards: number
  columns?: number
  onLike?: (index: number) => void
  onPass?: (index: number) => void
  onExpand?: (index: number) => void
}

interface UseDiscoverKeyboardResult {
  focusedIndex: number
  setFocusedIndex: (index: number) => void
}

function isInteractiveElement(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if ((el as HTMLElement).isContentEditable) return true
  const role = el.getAttribute('role')
  if (role === 'textbox' || role === 'searchbox' || role === 'combobox') return true
  return false
}

/**
 * Keyboard navigation for the discover profile grid.
 *
 * Arrow keys: move focus between cards in the grid.
 * L: like the focused card.
 * P: pass the focused card.
 * Enter / Space: expand card detail.
 *
 * The handler is disabled when the active element is an input/textarea
 * to avoid capturing keystrokes during typing.
 */
export function useDiscoverKeyboard({
  totalCards,
  columns = 3,
  onLike,
  onPass,
  onExpand,
}: UseDiscoverKeyboardOptions): UseDiscoverKeyboardResult {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const focusedRef = useRef(focusedIndex)

  useEffect(() => {
    focusedRef.current = focusedIndex
  }, [focusedIndex])

  const clamp = useCallback(
    (index: number) => Math.max(0, Math.min(totalCards - 1, index)),
    [totalCards]
  )

  const moveFocus = useCallback(
    (delta: number) => {
      setFocusedIndex((prev) => {
        const next = prev < 0 ? 0 : clamp(prev + delta)
        return next
      })
    },
    [clamp]
  )

  useEffect(() => {
    if (totalCards === 0) return

    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in inputs
      if (isInteractiveElement(document.activeElement)) return

      const current = focusedRef.current

      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault()
          moveFocus(1)
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          moveFocus(-1)
          break
        }
        case 'ArrowDown': {
          e.preventDefault()
          moveFocus(columns)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          moveFocus(-columns)
          break
        }
        case 'l':
        case 'L': {
          if (current >= 0 && onLike) {
            e.preventDefault()
            onLike(current)
          }
          break
        }
        case 'p':
        case 'P': {
          if (current >= 0 && onPass) {
            e.preventDefault()
            onPass(current)
          }
          break
        }
        case 'Enter':
        case ' ': {
          if (current >= 0 && onExpand) {
            e.preventDefault()
            onExpand(current)
          }
          break
        }
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalCards, columns, onLike, onPass, onExpand, moveFocus])

  // Sync DOM focus when focusedIndex changes
  useEffect(() => {
    if (focusedIndex < 0) return
    const card = document.querySelector<HTMLElement>(
      `[data-card-index="${focusedIndex}"]`
    )
    card?.focus({ preventScroll: false })
  }, [focusedIndex])

  return { focusedIndex, setFocusedIndex }
}
