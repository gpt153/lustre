/**
 * usePressAnimation
 *
 * A reusable hook for press scale + spring animation with optional lift effect.
 *
 * Features:
 * - Customizable scale (default: INTERACTION.pressScale = 0.97)
 * - Optional vertical lift on press (default: INTERACTION.hoverLift = -2, disabled)
 * - Respects useReducedMotion — no scale/lift when reduced motion is active
 * - Uses SPRING.snappy for press-in, SPRING.default for release
 *
 * Returns { animatedStyle, onPressIn, onPressOut } for use in Pressable components.
 */

import { useCallback } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useReducedMotion } from 'react-native-reanimated'
import { SPRING, INTERACTION, REDUCED_MOTION } from '@/constants/animations'

export interface UsePressAnimationOptions {
  /** Scale factor on press-in. Default: INTERACTION.pressScale (0.97) */
  scale?: number
  /** Vertical translateY offset on press-in (negative = up). Default: 0 (disabled) */
  liftY?: number
}

export interface PressAnimationState {
  animatedStyle: ReturnType<typeof useAnimatedStyle>
  onPressIn: () => void
  onPressOut: () => void
}

export function usePressAnimation(
  options?: UsePressAnimationOptions,
): PressAnimationState {
  const reducedMotion = useReducedMotion()

  const targetScale = options?.scale ?? INTERACTION.pressScale
  const targetLiftY = options?.liftY ?? 0

  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

  const handlePressIn = useCallback(() => {
    const springConfig = reducedMotion ? REDUCED_MOTION.spring : SPRING.snappy
    const finalScale = reducedMotion ? 1 : targetScale
    const finalLiftY = reducedMotion ? 0 : targetLiftY

    scale.value = withSpring(finalScale, springConfig)
    if (targetLiftY !== 0) {
      translateY.value = withSpring(finalLiftY, springConfig)
    }
  }, [scale, translateY, targetScale, targetLiftY, reducedMotion])

  const handlePressOut = useCallback(() => {
    const springConfig = reducedMotion ? REDUCED_MOTION.spring : SPRING.default

    scale.value = withSpring(1, springConfig)
    if (targetLiftY !== 0) {
      translateY.value = withSpring(0, springConfig)
    }
  }, [scale, translateY, targetLiftY, reducedMotion])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  return {
    animatedStyle,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  }
}
