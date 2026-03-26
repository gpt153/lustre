import * as React from 'react'
import { Redirect, Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig, useFonts, loadLustreFonts } from '@lustre/ui'
import { TRPCProvider } from '@lustre/api'
import { StatusBar } from 'expo-status-bar'
import Constants from 'expo-constants'
import { useAuth } from '@lustre/app'

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:4000'

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync()

function RootLayoutContent() {
  const auth = useAuth()

  if (!auth.isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />
  }

  if (auth.needsPayment) {
    return <Redirect href="/(auth)/payment" />
  }

  if (auth.needsDisplayName) {
    return <Redirect href="/(auth)/display-name" />
  }

  return <Slot />
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  React.useEffect(() => {
    async function loadFonts() {
      try {
        await loadLustreFonts()
        setFontsLoaded(true)
      } catch (error) {
        console.error('Failed to load fonts:', error)
        // Continue anyway - fonts will fall back to system defaults
        setFontsLoaded(true)
      } finally {
        await SplashScreen.hideAsync()
      }
    }

    loadFonts()
  }, [])

  if (!fontsLoaded) {
    return null
  }

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <TRPCProvider apiUrl={API_URL}>
        <StatusBar style="auto" />
        <RootLayoutContent />
      </TRPCProvider>
    </TamaguiProvider>
  )
}
