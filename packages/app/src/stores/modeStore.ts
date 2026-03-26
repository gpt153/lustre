import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ModeState {
  mode: 'vanilla' | 'spicy'
  setMode: (mode: 'vanilla' | 'spicy') => void
}

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'vanilla',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'lustre-mode',
      storage: storage ?? createJSONStorage(() => ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
)
