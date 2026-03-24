import { Redirect, Slot } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '@lustre/ui'
import { TRPCProvider } from '@lustre/api'
import { StatusBar } from 'expo-status-bar'
import Constants from 'expo-constants'
import { useAuth } from '@lustre/app'

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:4000'

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
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <TRPCProvider apiUrl={API_URL}>
        <StatusBar style="auto" />
        <RootLayoutContent />
      </TRPCProvider>
    </TamaguiProvider>
  )
}
