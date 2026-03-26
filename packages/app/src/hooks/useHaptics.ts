import { Platform } from 'react-native'

let Haptics: any = null

if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics')
  } catch (e) {
    Haptics = null
  }
}

export function useHaptics() {
  const impactLight = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const impactMedium = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const impactHeavy = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }

  const selection = () => {
    if (Haptics) Haptics.selectionAsync()
  }

  return { impactLight, impactMedium, impactHeavy, selection }
}
