/**
 * useLongPress
 *
 * A hook wrapping Gesture.LongPress with haptic feedback.
 *
 * Features:
 * - Configurable duration (default: INTERACTION.longPressDuration = 500ms)
 * - Fires Haptics.impactAsync(Medium) on activation
 * - Returns a gesture object for use with GestureDetector
 * - Respects useReducedMotion (fires haptic, skips visual feedback if needed)
 */

import { useCallback, useRef } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { useReducedMotion } from 'react-native-reanimated'
import { INTERACTION } from '@/constants/animations'

export interface UseLongPressOptions {
  /** Long-press duration in milliseconds. Default: INTERACTION.longPressDuration (500) */
  duration?: number
}

export function useLongPress(
  onLongPress: () => void,
  options?: UseLongPressOptions,
): ReturnType<typeof Gesture.LongPress> {
  const reducedMotion = useReducedMotion()
  const duration = options?.duration ?? INTERACTION.longPressDuration
  const gestureRef = useRef<ReturnType<typeof Gesture.LongPress> | null>(null)

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // Silently ignore if haptics unavailable
    })
    onLongPress()
  }, [onLongPress])

  if (!gestureRef.current) {
    gestureRef.current = Gesture.LongPress()
      .minDuration(duration)
      .onStart(() => {
        handleLongPress()
      })
  }

  return gestureRef.current
}
