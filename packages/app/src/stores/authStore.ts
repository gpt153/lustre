import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  displayName: string | null
  isAuthenticated: boolean
  needsPayment: boolean
  needsDisplayName: boolean
  tempRegistrationToken: string | null
  setTokens: (access: string, refresh: string) => void
  setUser: (userId: string, displayName: string | null) => void
  setNeedsPayment: (v: boolean) => void
  setNeedsDisplayName: (v: boolean) => void
  setTempRegistrationToken: (token: string | null) => void
  logout: () => void
}

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      displayName: null,
      isAuthenticated: false,
      needsPayment: false,
      needsDisplayName: false,
      tempRegistrationToken: null,
      setTokens: (access, refresh) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),
      setUser: (userId, displayName) =>
        set({
          userId,
          displayName,
          needsDisplayName: !displayName,
        }),
      setNeedsPayment: (v) => set({ needsPayment: v }),
      setNeedsDisplayName: (v) => set({ needsDisplayName: v }),
      setTempRegistrationToken: (token) => set({ tempRegistrationToken: token }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          displayName: null,
          isAuthenticated: false,
          needsPayment: false,
          needsDisplayName: false,
          tempRegistrationToken: null,
        }),
    }),
    {
      name: 'lustre-auth',
      storage: storage ?? createJSONStorage(() => ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
        displayName: state.displayName,
        isAuthenticated: state.isAuthenticated,
        tempRegistrationToken: state.tempRegistrationToken,
      }),
    }
  )
)
