/**
 * Auth utilities — thin wrapper around the auth store and tRPC api client.
 *
 * All functions are safe to call from both React components and plain modules.
 * They operate synchronously on the Zustand store after awaiting async I/O.
 */

import { api as _api } from '@/lib/trpc'
import { useAuthStore } from '@/lib/stores'

// Cast to any to work around the tRPC proxy union type inference issue —
// the vanilla proxy client is typed as `any` at creation so all paths exist at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

// ============================================================
// Types
// ============================================================

export interface AuthResult {
  success: boolean
  error?: string
}

// ============================================================
// login
// ============================================================

/**
 * Authenticate with email + password.
 * On success, stores the access token and refresh token in the auth store.
 * Caller is responsible for redirecting after success.
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await api.auth.loginWithEmail.mutate({ email, password })

    const token: string = result?.token ?? result?.accessToken
    const userId: string = result?.userId
    const refreshToken: string | undefined = result?.refreshToken

    if (!token || !userId) {
      return { success: false, error: 'Ogiltigt svar från servern.' }
    }

    useAuthStore.getState().setAuth(token, userId, refreshToken)
    return { success: true }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Inloggning misslyckades. Försök igen.'
    return { success: false, error: message }
  }
}

// ============================================================
// logout
// ============================================================

/**
 * Clear the auth store and redirect to /login.
 * Must be called in a browser context (uses window.location).
 */
export function logout(): void {
  useAuthStore.getState().clearAuth()

  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// ============================================================
// refreshToken
// ============================================================

/**
 * Exchange the stored refresh token for a new access token.
 * Silently clears auth and returns failure if no refresh token is stored.
 */
export async function refreshToken(): Promise<AuthResult> {
  const { refreshToken: storedRefreshToken } = useAuthStore.getState()

  if (!storedRefreshToken) {
    useAuthStore.getState().clearAuth()
    return { success: false, error: 'Ingen refresh token.' }
  }

  try {
    const result = await api.auth.refreshToken.mutate({
      refreshToken: storedRefreshToken,
    })

    const token: string = result?.token ?? result?.accessToken
    const userId: string = result?.userId
    const newRefreshToken: string | undefined = result?.refreshToken

    if (!token || !userId) {
      useAuthStore.getState().clearAuth()
      return { success: false, error: 'Token-förnyelse misslyckades.' }
    }

    useAuthStore.getState().setAuth(token, userId, newRefreshToken ?? storedRefreshToken)
    return { success: true }
  } catch (err: unknown) {
    useAuthStore.getState().clearAuth()
    const message =
      err instanceof Error ? err.message : 'Token-förnyelse misslyckades.'
    return { success: false, error: message }
  }
}

// ============================================================
// devLogin
// ============================================================

/**
 * Log in with the seeded admin test account.
 * Only intended for local development — the button is conditionally
 * rendered behind `process.env.NODE_ENV === 'development'`.
 */
export async function devLogin(): Promise<AuthResult> {
  return login('admin@lovelustre.com', 'admin123')
}

// ============================================================
// getIsAuthenticated
// ============================================================

/**
 * Read the current authentication state from the store.
 * Returns false during SSR or before hydration.
 */
export function getIsAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return useAuthStore.getState().isAuthenticated
}
