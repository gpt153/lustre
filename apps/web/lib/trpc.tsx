'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

/**
 * Helper to read the auth token from the Zustand persisted store in localStorage.
 * This avoids a React hook dependency so the vanilla tRPC client can use it.
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('lustre-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

/**
 * Vanilla tRPC client — use this for direct API calls.
 * Auth token is read from the Zustand auth store (persisted in localStorage)
 * and sent as a Bearer header. Cookie fallback is also supported.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = createTRPCProxyClient<any>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: '/trpc',
      fetch(url, options) {
        const token = getAuthToken()
        const headers = new Headers(options?.headers)
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        return fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        })
      },
    }),
  ],
})

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
