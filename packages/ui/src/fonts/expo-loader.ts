/**
 * Expo font loader for Lustre typography
 *
 * Loads Noto Serif (serif headings) and Manrope (sans-serif body) before
 * rendering the app.  The splash screen must be kept visible until this
 * resolves — see apps/mobile/app/_layout.tsx for the integration.
 *
 * Usage in app/_layout.tsx:
 *   import { loadLustreFonts } from '@lustre/ui/src/fonts/expo-loader'
 *   await loadLustreFonts()       // inside an async effect
 */

import * as React from 'react'
import * as Font from 'expo-font'
import {
  NotoSerif_400Regular,
  NotoSerif_400Regular_Italic,
  NotoSerif_700Bold,
} from '@expo-google-fonts/noto-serif'
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope'

/**
 * Load all Lustre fonts via expo-font.
 * Returns a promise that resolves when every font asset is ready.
 */
export async function loadLustreFonts(): Promise<void> {
  await Font.loadAsync({
    // Noto Serif — headings
    NotoSerif_400Regular,
    NotoSerif_400Regular_Italic,
    NotoSerif_700Bold,
    // Manrope — body / labels
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  })
}

/**
 * Hook to load Lustre fonts in an Expo component tree.
 *
 * Returns `true` once all fonts are loaded.
 *
 * Example:
 *   const fontsLoaded = useFonts()
 *   if (!fontsLoaded) return <SplashScreen />
 */
export function useFonts(): boolean {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      await loadLustreFonts()
      if (!cancelled) setFontsLoaded(true)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return fontsLoaded
}
