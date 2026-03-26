/**
 * Expo font loader for Lustre typography
 * Loads General Sans and Inter fonts before rendering the app
 *
 * Usage in app/_layout.tsx:
 * const fontsLoaded = useFonts();
 * if (!fontsLoaded) {
 *   return <SplashScreen />;
 * }
 */

import * as React from 'react'
import * as Font from 'expo-font'

/**
 * Load all fonts required by Lustre
 * Returns a promise that resolves when all fonts are loaded
 */
export async function loadLustreFonts() {
  try {
    await Font.loadAsync({
      // General Sans variable font - for headings and logo
      'GeneralSans-Regular': require('@fontsource-variable/general-sans/files/general-sans-latin-wght.ttf'),
      'GeneralSans-Medium': require('@fontsource-variable/general-sans/files/general-sans-latin-wght.ttf'),
      'GeneralSans-SemiBold': require('@fontsource-variable/general-sans/files/general-sans-latin-wght.ttf'),
      'GeneralSans-Bold': require('@fontsource-variable/general-sans/files/general-sans-latin-wght.ttf'),

      // Inter fonts - for body text
      'Inter-Regular': require('@fontsource/inter/files/inter-latin-400-normal.ttf'),
      'Inter-Medium': require('@fontsource/inter/files/inter-latin-500-normal.ttf'),
      'Inter-SemiBold': require('@fontsource/inter/files/inter-latin-600-normal.ttf'),
    })
  } catch (error) {
    console.error('Error loading Lustre fonts:', error)
    throw error
  }
}

/**
 * Hook to load fonts in Expo app
 * Usage:
 * const fontsLoaded = useFonts();
 * if (!fontsLoaded) return <SplashScreen />;
 */
export function useFonts() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  React.useEffect(() => {
    async function loadFonts() {
      await loadLustreFonts()
      setFontsLoaded(true)
    }
    loadFonts()
  }, [])

  return fontsLoaded
}
