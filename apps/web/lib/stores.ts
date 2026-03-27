import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// Auth Store
// ============================================================

interface AuthState {
  token: string | null
  refreshToken: string | null
  userId: string | null
  isAuthenticated: boolean
  setAuth: (token: string, userId: string, refreshToken?: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,

      setAuth(token, userId, refreshToken) {
        set({ token, userId, isAuthenticated: true, refreshToken: refreshToken ?? null })
      },

      clearAuth() {
        set({ token: null, refreshToken: null, userId: null, isAuthenticated: false })
      },
    }),
    {
      name: 'lustre-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
    }
  )
)
