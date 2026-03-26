'use client'

import { TamaguiProvider } from 'tamagui'
import { config } from '@lustre/ui'
import { TRPCProvider } from '@lustre/api'
import { useAuthStore } from '@lustre/app'
import { ThemeProvider } from 'next-themes'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export function Providers({ children }: { children: React.ReactNode }) {
  const getToken = () => useAuthStore.getState().accessToken

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TamaguiProvider config={config} defaultTheme="light">
        <TRPCProvider apiUrl={API_URL} getToken={getToken}>
          {children}
        </TRPCProvider>
      </TamaguiProvider>
    </ThemeProvider>
  )
}
