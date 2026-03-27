'use client'

import { useEffect, useState } from 'react'
import { useModeStore } from '@lustre/app'

type Theme = 'light' | 'dark'
type Mode = 'vanilla' | 'spicy'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light')
  const { mode, setMode: setModeStore } = useModeStore()

  const setTheme = (next: Theme) => {
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('lustre-theme', next)
    setThemeState(next)
  }

  const setMode = (next: Mode) => {
    document.documentElement.setAttribute('data-mode', next)
    setModeStore(next)
  }

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('lustre-theme') as Theme | null
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved)
      setThemeState(saved)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark')
      setThemeState('dark')
    }

    // Listen for system preference changes
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const storedTheme = localStorage.getItem('lustre-theme')
      // Only follow system if user has not explicitly set a preference
      if (!storedTheme) {
        const systemTheme: Theme = e.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', systemTheme)
        setThemeState(systemTheme)
      }
    }
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  // Sync mode from store to DOM on mount and whenever mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
  }, [mode])

  return { theme, mode, setTheme, setMode }
}
