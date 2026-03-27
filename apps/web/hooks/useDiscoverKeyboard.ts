'use client'

import { useEffect, useCallback } from 'react'

interface UseDiscoverKeyboardOptions {
  profileIds: string[]
  focusedId: string | null
  onFocus: (id: string | null) => void
  onLike: (id: string) => void
  onPass: (id: string) => void
  onSuperLike: (id: string) => void
  onOpen: (id: string) => void
}

export function useDiscoverKeyboard({
  profileIds,
  focusedId,
  onFocus,
  onLike,
  onPass,
  onSuperLike,
  onOpen,
}: UseDiscoverKeyboardOptions) {
  const getColumnCount = useCallback((): number => {
    if (typeof window === 'undefined') return 4
    const width = window.innerWidth
    if (width <= 900) return 2
    if (width <= 1200) return 3
    return 4
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      if (isInputField) return

      if (profileIds.length === 0) return

      const currentIndex = focusedId ? profileIds.indexOf(focusedId) : -1
      const columns = getColumnCount()

      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault()
          const nextIndex =
            currentIndex < 0 ? 0 : Math.min(currentIndex + 1, profileIds.length - 1)
          onFocus(profileIds[nextIndex])
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          if (currentIndex <= 0) break
          onFocus(profileIds[currentIndex - 1])
          break
        }
        case 'ArrowDown': {
          e.preventDefault()
          const downIndex =
            currentIndex < 0 ? 0 : Math.min(currentIndex + columns, profileIds.length - 1)
          onFocus(profileIds[downIndex])
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          if (currentIndex < 0) break
          const upIndex = Math.max(currentIndex - columns, 0)
          onFocus(profileIds[upIndex])
          break
        }
        case 'l':
        case 'L': {
          if (focusedId) {
            e.preventDefault()
            onLike(focusedId)
          }
          break
        }
        case 'p':
        case 'P': {
          if (focusedId) {
            e.preventDefault()
            onPass(focusedId)
          }
          break
        }
        case 's':
        case 'S': {
          if (focusedId) {
            e.preventDefault()
            onSuperLike(focusedId)
          }
          break
        }
        case 'Enter': {
          if (focusedId) {
            e.preventDefault()
            onOpen(focusedId)
          }
          break
        }
        default:
          break
      }
    },
    [profileIds, focusedId, onFocus, onLike, onPass, onSuperLike, onOpen, getColumnCount]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
