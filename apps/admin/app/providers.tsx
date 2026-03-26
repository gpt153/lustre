'use client'

import { TRPCProvider } from '@lustre/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''

  return (
    <TRPCProvider apiUrl={apiUrl} getToken={getToken}>
      {children}
    </TRPCProvider>
  )
}
