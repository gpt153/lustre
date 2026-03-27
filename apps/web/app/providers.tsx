'use client'

import { useEffect } from 'react'
import { TRPCProvider } from '@/lib/trpc'
import { initTheme, useThemeStore } from '@/hooks/useTheme'
import { useAuthStore } from '@/lib/stores'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate persisted theme store
    useThemeStore.persist.rehydrate()
    // Apply theme attributes before paint
    initTheme()
  }, [])

  return <>{children}</>
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate persisted auth store
    useAuthStore.persist.rehydrate()
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </TRPCProvider>
  )
}
