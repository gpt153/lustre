'use client'
import { useEffect, useCallback } from 'react'

type ShortcutMap = Record<string, () => void>

function buildKeyString(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl')
  if (e.shiftKey) parts.push('Shift')
  if (e.altKey) parts.push('Alt')
  parts.push(e.key)
  return parts.join('+')
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    if (isInputField) {
      // Only allow Escape and Ctrl+K in input fields
      if (e.key !== 'Escape' && !(e.ctrlKey && e.key === 'k') && !((e.ctrlKey || e.metaKey) && e.key === 'k')) return
    }

    const key = buildKeyString(e)
    if (shortcuts[key]) {
      e.preventDefault()
      shortcuts[key]()
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
