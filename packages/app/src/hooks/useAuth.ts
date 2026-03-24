import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const store = useAuthStore()
  return {
    isAuthenticated: store.isAuthenticated,
    needsPayment: store.needsPayment,
    needsDisplayName: store.needsDisplayName,
    userId: store.userId,
    displayName: store.displayName,
    accessToken: store.accessToken,
    logout: store.logout,
  }
}
