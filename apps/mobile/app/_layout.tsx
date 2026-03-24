import { Slot } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '@lustre/ui'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <StatusBar style="auto" />
      <Slot />
    </TamaguiProvider>
  )
}
