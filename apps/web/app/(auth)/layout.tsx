'use client'

import { TRPCProvider } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const getToken = () => useAuthStore.getState().accessToken

  return (
    <TRPCProvider apiUrl={API_URL} getToken={getToken}>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDF8F3' }}>
        <div style={{ width: '100%', maxWidth: 448, padding: '0 16px' }}>
          {children}
        </div>
      </div>
    </TRPCProvider>
  )
}
