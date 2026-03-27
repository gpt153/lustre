/**
 * AnimatedPressable
 *
 * An accessible, animated drop-in replacement for React Native's Pressable.
 *
 * Features:
 * - Required accessibilityRole and accessibilityLabel props (enforced by type)
 * - Optional accessibilityHint, accessibilityActions, onAccessibilityAction
 * - Reanimated withSpring scale-down (0.97) on press-in, scale-up on press-out
 * - Animations are disabled (scale stays at 1) when the OS reduce-motion
 *   preference is active, detected via Reanimated's useReducedMotion()
 * - Minimum 44×44pt touch target via minHeight / minWidth + HIT_SLOP_DEFAULT
 */

import React, { useCallback } from 'react'
import {
  AccessibilityActionEvent,
  AccessibilityRole,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useReducedMotion } from 'react-native-reanimated'
import { SPRING, REDUCED_MOTION } from '@/constants/animations'
import { MIN_TOUCH_TARGET, HIT_SLOP_DEFAULT } from '@/constants/accessibility'

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable)

export interface AnimatedPressableProps
  extends Omit<PressableProps, 'style' | 'accessibilityRole' | 'accessibilityLabel'> {
  /** ARIA role announced to screen readers. Required. */
  accessibilityRole: AccessibilityRole
  /** Human-readable label announced to screen readers. Required. */
  accessibilityLabel: string
  /** Additional context announced after the label. */
  accessibilityHint?: string
  /** Custom actions exposed to VoiceOver / TalkBack (e.g. Like, Pass). */
  accessibilityActions?: ReadonlyArray<{ name: string; label?: string }>
  /** Handler for custom accessibility actions. */
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

export function AnimatedPressable({
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityActions,
  onAccessibilityAction,
  style,
  children,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: AnimatedPressableProps) {
  const reducedMotion = useReducedMotion()
  const scale = useSharedValue(1)

  const springConfig = reducedMotion ? REDUCED_MOTION.spring : SPRING.snappy
  const targetScale = reducedMotion ? REDUCED_MOTION.pressScale : 0.97

  const handlePressIn = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      scale.value = withSpring(targetScale, springConfig)
      onPressIn?.(event)
    },
    [scale, targetScale, springConfig, onPressIn],
  )

  const handlePressOut = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      scale.value = withSpring(1, springConfig)
      onPressOut?.(event)
    },
    [scale, springConfig, onPressOut],
  )

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressableBase
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      hitSlop={HIT_SLOP_DEFAULT}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.base, animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
  },
})
