'use client'
import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'lustre-sounds'

// Read preference from localStorage
function getEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored !== 'false'
}

// Subscribe to storage events for cross-tab sync
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function useSound() {
  const isEnabled = useSyncExternalStore(subscribe, getEnabled, () => true)

  const play = useCallback(
    async (name: string) => {
      if (!isEnabled) return
      const { playSound } = await import('@/lib/sound-manager')
      await playSound(name as Parameters<typeof playSound>[0])
    },
    [isEnabled],
  )

  const setEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(enabled))
    window.dispatchEvent(new Event('storage'))
  }, [])

  return { play, isEnabled, setEnabled }
}
