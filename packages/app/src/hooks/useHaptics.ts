import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

export function useHaptics() {
  const impactLight = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const impactMedium = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }

  const impactHeavy = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    }
  }

  const selection = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync()
    }
  }

  return { impactLight, impactMedium, impactHeavy, selection }
}
