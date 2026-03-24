'use client'

import { TamaguiProvider } from 'tamagui'
import { config } from '@lustre/ui'
import { TRPCProvider } from '@lustre/api'
import { ThemeProvider } from 'next-themes'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TamaguiProvider config={config} defaultTheme="light">
        <TRPCProvider apiUrl={API_URL}>
          {children}
        </TRPCProvider>
      </TamaguiProvider>
    </ThemeProvider>
  )
}
