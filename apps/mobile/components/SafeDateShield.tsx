/**
 * SafeDateShield
 *
 * An absolute-positioned copper border that pulses on the screen edges
 * while SafeDate is active. Rendered from _layout.tsx (or a parent screen)
 * only when safeDateActive is true.
 *
 * Reduced-motion: opacity is set to the mid-value (0.20) with no pulse.
 */

import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { COLORS } from '@/constants/tokens'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BORDER_WIDTH = 2
const OPACITY_LOW = 0.15
const OPACITY_HIGH = 0.25
const PULSE_DURATION = 1500

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SafeDateShieldProps {
  /** When false the component renders nothing (allows conditional parent logic). */
  active?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SafeDateShield({ active = true }: SafeDateShieldProps) {
  const reducedMotion = useReducedMotion()
  const borderOpacity = useSharedValue(reducedMotion ? (OPACITY_LOW + OPACITY_HIGH) / 2 : OPACITY_LOW)

  useEffect(() => {
    if (!active) {
      borderOpacity.value = withTiming(0, { duration: 300 })
      return
    }

    if (reducedMotion) {
      borderOpacity.value = (OPACITY_LOW + OPACITY_HIGH) / 2
      return
    }

    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(OPACITY_HIGH, { duration: PULSE_DURATION }),
        withTiming(OPACITY_LOW, { duration: PULSE_DURATION }),
      ),
      -1,
    )
  }, [active, reducedMotion])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }))

  if (!active) return null

  return (
    <Animated.View style={[styles.shield, animatedStyle]} pointerEvents="none">
      {/* Top edge */}
      <View style={[styles.edge, styles.top]} />
      {/* Bottom edge */}
      <View style={[styles.edge, styles.bottom]} />
      {/* Left edge */}
      <View style={[styles.edge, styles.left]} />
      {/* Right edge */}
      <View style={[styles.edge, styles.right]} />
    </Animated.View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  shield: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  edge: {
    position: 'absolute',
    backgroundColor: COLORS.copper,
  },
  top: {
    top: 0,
    left: 0,
    right: 0,
    height: BORDER_WIDTH,
  },
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
    height: BORDER_WIDTH,
  },
  left: {
    top: 0,
    bottom: 0,
    left: 0,
    width: BORDER_WIDTH,
  },
  right: {
    top: 0,
    bottom: 0,
    right: 0,
    width: BORDER_WIDTH,
  },
})
