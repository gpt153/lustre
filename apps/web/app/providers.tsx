'use client'

import { TamaguiProvider } from 'tamagui'
import { config } from '@lustre/ui'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TamaguiProvider config={config} defaultTheme="light">
        {children}
      </TamaguiProvider>
    </ThemeProvider>
  )
}
