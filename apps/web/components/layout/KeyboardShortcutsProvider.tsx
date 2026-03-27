'use client'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { CommandPalette } from '@/components/common/CommandPalette'
import { ShortcutOverlay } from '@/components/common/ShortcutOverlay'
import { useState } from 'react'

interface Props {
  children: React.ReactNode
}

export function KeyboardShortcutsProvider({ children }: Props) {
  const { isOpen: isPaletteOpen, open: openPalette, close: closePalette } = useCommandPalette()
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  // Register global keyboard shortcuts
  useKeyboardShortcuts({
    'Ctrl+k': openPalette,
    'Meta+k': openPalette, // macOS
    '?': () => setIsShortcutsOpen(true),
    'Escape': () => {
      if (isPaletteOpen) closePalette()
      if (isShortcutsOpen) setIsShortcutsOpen(false)
    },
  })

  return (
    <>
      {children}
      <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />
      <ShortcutOverlay isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </>
  )
}
