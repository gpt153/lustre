/**
 * useFormShake — Form-level shake animation with haptic error feedback.
 *
 * Usage:
 *   const { shake, animatedStyle } = useFormShake()
 *
 *   // Wrap the form in an Animated.View with animatedStyle,
 *   // then call shake() when submit fails.
 */

import { useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

export function useFormShake() {
  const shakeX = useSharedValue(0)

  const shake = useCallback(() => {
    // Trigger haptic feedback on UI thread
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

    // 6-step shake: ±4px at 50ms each
    shakeX.value = withSequence(
      withTiming(4, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    )
  }, [shakeX])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }))

  return { shake, animatedStyle }
}
