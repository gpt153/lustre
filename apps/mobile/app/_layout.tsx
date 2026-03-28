import * as React from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '@lustre/ui'
import { loadLustreFonts, useFonts } from '@lustre/ui/src/fonts/expo-loader'
import { TRPCProvider } from '@lustre/api'
import { StatusBar } from 'expo-status-bar'
import Constants from 'expo-constants'
import { useAuth } from '@lustre/app'

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://api.lovelustre.com'

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync()

function useProtectedRoute() {
  const auth = useAuth()
  const router = useRouter()
  const segments = useSegments()

  React.useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'

    if (!auth.isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome')
    } else if (auth.isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [auth.isAuthenticated, auth.needsPayment, auth.needsDisplayName, segments])
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  React.useEffect(() => {
    async function loadFonts() {
      try {
        await loadLustreFonts()
      } catch (error) {
        console.error('Failed to load fonts:', error)
      } finally {
        setFontsLoaded(true)
        await SplashScreen.hideAsync()
      }
    }

    loadFonts()
  }, [])

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <TRPCProvider apiUrl={API_URL}>
        <StatusBar style="auto" />
        {fontsLoaded ? <AuthGate /> : <Slot />}
      </TRPCProvider>
    </TamaguiProvider>
  )
}

function AuthGate() {
  useProtectedRoute()
  return <Slot />
}
