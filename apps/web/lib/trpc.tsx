'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('lustre-auth')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

/**
 * Vanilla tRPC client — use this for direct API calls.
 * Type-safe integration will be added when we connect to the actual API router types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = createTRPCProxyClient<any>({
  links: [
    httpBatchLink({
      url: '/trpc',
      headers() {
        const token = getAuthToken()
        return token ? { Authorization: `Bearer ${token}` } : {}
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
