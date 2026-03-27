/**
 * useDoubleTap
 *
 * A hook wrapping Gesture.Tap with numberOfTaps(2) and haptic feedback.
 *
 * Features:
 * - Detects double-tap gesture
 * - Fires Haptics.impactAsync(Light) on activation
 * - Returns a gesture object for use with GestureDetector
 * - Respects useReducedMotion (fires haptic regardless)
 */

import { useCallback, useRef } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { useReducedMotion } from 'react-native-reanimated'

export function useDoubleTap(
  onDoubleTap: () => void,
): ReturnType<typeof Gesture.Tap> {
  const reducedMotion = useReducedMotion()
  const gestureRef = useRef<ReturnType<typeof Gesture.Tap> | null>(null)

  const handleDoubleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Silently ignore if haptics unavailable
    })
    onDoubleTap()
  }, [onDoubleTap])

  if (!gestureRef.current) {
    gestureRef.current = Gesture.Tap()
      .numberOfTaps(2)
      .onStart(() => {
        handleDoubleTap()
      })
  }

  return gestureRef.current
}
