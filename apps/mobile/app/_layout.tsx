import { Slot } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '@lustre/ui'
import { TRPCProvider } from '@lustre/api'
import { StatusBar } from 'expo-status-bar'
import Constants from 'expo-constants'

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:4000'

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <TRPCProvider apiUrl={API_URL}>
        <StatusBar style="auto" />
        <Slot />
      </TRPCProvider>
    </TamaguiProvider>
  )
}
