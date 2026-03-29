import * as React from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { TamaguiProvider } from 'tamagui'
import { ThemeProvider, DefaultTheme } from '@react-navigation/native'
import { tamaguiConfig } from '@lustre/ui'
import { loadLustreFonts, useFonts } from '@lustre/ui/src/fonts/expo-loader'
import { TRPCProvider } from '@lustre/api'
import { StatusBar } from 'expo-status-bar'
import Constants from 'expo-constants'
import { useAuth, useAuthStore } from '@lustre/app'

const LustreNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FDF8F3',
    card: '#FDF8F3',
    text: '#2C2421',
    border: 'rgba(216,195,180,0.20)',
    primary: '#894d0d',
  },
}

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
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ThemeProvider value={LustreNavTheme}>
        <TRPCProvider apiUrl={API_URL} getToken={() => useAuthStore.getState().accessToken}>
          <StatusBar style="dark" />
          {fontsLoaded ? <AuthGate /> : <Slot />}
        </TRPCProvider>
      </ThemeProvider>
    </TamaguiProvider>
  )
}

function AuthGate() {
  useProtectedRoute()
  return <Slot />
}
