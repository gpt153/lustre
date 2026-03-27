/**
 * useKenBurns
 *
 * Drives a slow Ken Burns scale animation (1 → 1.05 over 8 s) on a photo
 * segment. The animation can be paused on long-press and resumed on release.
 * All animation work runs on the UI thread via Reanimated.
 */

import { useEffect } from 'react'
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const KEN_BURNS_DURATION = 8000
const KEN_BURNS_TARGET_SCALE = 1.05

export interface UseKenBurnsResult {
  /** Animated style containing the scale transform. Apply to the photo view. */
  kenBurnsStyle: ReturnType<typeof useAnimatedStyle>
  /** Call when a long-press begins to pause the animation. */
  pauseKenBurns: () => void
  /** Call when the long-press ends to resume from where the scale left off. */
  resumeKenBurns: () => void
}

/**
 * @param active - Set to true when this photo segment is the current one.
 *                 The animation resets to 1 and begins whenever active becomes true.
 */
export function useKenBurns(active: boolean): UseKenBurnsResult {
  const scale = useSharedValue(1)

  useEffect(() => {
    if (active) {
      // Always restart from 1 when the segment becomes active.
      scale.value = 1
      scale.value = withTiming(KEN_BURNS_TARGET_SCALE, {
        duration: KEN_BURNS_DURATION,
        easing: Easing.linear,
      })
    } else {
      cancelAnimation(scale)
      scale.value = 1
    }
  }, [active, scale])

  const kenBurnsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const pauseKenBurns = () => {
    'worklet'
    cancelAnimation(scale)
  }

  const resumeKenBurns = () => {
    'worklet'
    // Animate from current scale to target over remaining proportional time.
    const remaining =
      ((KEN_BURNS_TARGET_SCALE - scale.value) /
        (KEN_BURNS_TARGET_SCALE - 1)) *
      KEN_BURNS_DURATION
    scale.value = withTiming(KEN_BURNS_TARGET_SCALE, {
      duration: Math.max(remaining, 0),
      easing: Easing.linear,
    })
  }

  return { kenBurnsStyle, pauseKenBurns, resumeKenBurns }
}
