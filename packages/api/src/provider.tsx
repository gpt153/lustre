'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc, createTRPCClient } from './trpc-client'

interface TRPCProviderProps {
  children: React.ReactNode
  apiUrl?: string
  getToken?: () => string | null
}

export function TRPCProvider({ children, apiUrl = 'http://localhost:4000', getToken }: TRPCProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))
  const [trpcClient] = useState(() => createTRPCClient(apiUrl, getToken))

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
