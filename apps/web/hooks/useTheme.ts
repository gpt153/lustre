'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'
type Mode = 'vanilla' | 'spicy'

interface ThemeState {
  theme: Theme
  mode: Mode
  setTheme: (theme: Theme) => void
  setMode: (mode: Mode) => void
  toggleTheme: () => void
  toggleMode: () => void
}

function applyThemeAttributes(theme: Theme, mode: Mode): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.setAttribute('data-mode', mode)
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      mode: 'vanilla',

      setTheme(theme) {
        set({ theme })
        applyThemeAttributes(theme, get().mode)
      },

      setMode(mode) {
        set({ mode })
        applyThemeAttributes(get().theme, mode)

        // Optimistic tRPC fire-and-forget — no await, no error surface
        import('@/lib/trpc').then(({ api }) => {
          (api as any).settings.setMode.mutate({ mode }).catch(() => {
            // Intentionally swallowed — optimistic update stands
          })
        }).catch(() => {
          // tRPC not yet initialised (SSR or cold start) — safe to ignore
        })
      },

      toggleTheme() {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(next)
      },

      toggleMode() {
        const next: Mode = get().mode === 'vanilla' ? 'spicy' : 'vanilla'
        get().setMode(next)
      },
    }),
    {
      name: 'lustre-theme',
      // Only persist the data values, not the actions
      partialize: (state) => ({ theme: state.theme, mode: state.mode }),
      skipHydration: true,
    }
  )
)

/**
 * Initialise theme from localStorage (or system preference) before first
 * paint. Call once at the top of the app tree (inside a useEffect or via
 * the inline script in layout.tsx head).
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return

  const stored = localStorage.getItem('lustre-theme')
  let theme: Theme = 'dark'
  let mode: Mode = 'vanilla'

  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed?.state?.theme === 'light' || parsed?.state?.theme === 'dark') {
        theme = parsed.state.theme
      }
      if (parsed?.state?.mode === 'spicy' || parsed?.state?.mode === 'vanilla') {
        mode = parsed.state.mode
      }
    } catch {
      // Malformed storage — use defaults
    }
  } else {
    // Respect system preference if no stored preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark'
    } else {
      theme = 'light'
    }
  }

  applyThemeAttributes(theme, mode)
  useThemeStore.setState({ theme, mode })
}

/**
 * useTheme — primary hook for reading and mutating the active theme/mode.
 *
 * Must be used inside a component that has been hydrated from the store.
 * Call `useThemeStore.persist.rehydrate()` once at app startup if using
 * skipHydration, or rely on initTheme() + the provider to handle it.
 */
export function useTheme() {
  const { theme, mode, setTheme, setMode, toggleTheme, toggleMode } =
    useThemeStore()

  return {
    theme,
    mode,
    setTheme,
    setMode,
    toggleTheme,
    toggleMode,
    isSpicy: mode === 'spicy',
    isDark: theme === 'dark',
  }
}

export { useThemeStore }
