import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  displayName: string | null
  isAuthenticated: boolean
  needsPayment: boolean
  needsDisplayName: boolean
  setTokens: (access: string, refresh: string) => void
  setUser: (userId: string, displayName: string | null) => void
  setNeedsPayment: (v: boolean) => void
  setNeedsDisplayName: (v: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  displayName: null,
  isAuthenticated: false,
  needsPayment: false,
  needsDisplayName: false,
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
  logout: () =>
    set({
      accessToken: null,
      refreshToken: null,
      userId: null,
      displayName: null,
      isAuthenticated: false,
      needsPayment: false,
      needsDisplayName: false,
    }),
}))
