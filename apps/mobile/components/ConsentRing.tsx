/**
 * ConsentRing
 *
 * An animated copper circle that draws itself in over 1.5 s using
 * react-native-svg + Reanimated strokeDashoffset animation.
 *
 * When allConfirmed is true the ring fills with a gold gradient overlay
 * via expo-linear-gradient layered inside the SVG bounding box.
 *
 * Reduced-motion: ring appears fully drawn immediately (no stroke animation).
 */

import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated'
import Svg, { Circle as SvgCircle, Defs, RadialGradient, Stop, Circle } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '@/constants/tokens'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RING_SIZE = 280
const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CENTER = RING_SIZE / 2

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle)

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ConsentRingProps {
  /** 0–1 fill ratio representing how many items have been confirmed by both. */
  progress: number
  /** When true, the gold-gradient confirmation fill is shown. */
  allConfirmed: boolean
  children?: React.ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConsentRing({ progress, allConfirmed, children }: ConsentRingProps) {
  const reducedMotion = useReducedMotion()

  // strokeDashoffset: starts at circumference (invisible), animates to 0 (full)
  const dashOffset = useSharedValue(reducedMotion ? 0 : CIRCUMFERENCE)

  // Progress ring — copper arc showing how many items are confirmed
  const progressOffset = useSharedValue(
    reducedMotion ? CIRCUMFERENCE * (1 - progress) : CIRCUMFERENCE,
  )

  useEffect(() => {
    if (reducedMotion) {
      dashOffset.value = 0
    } else {
      dashOffset.value = withTiming(0, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      })
    }
  }, [])

  useEffect(() => {
    const targetOffset = CIRCUMFERENCE * (1 - progress)
    if (reducedMotion) {
      progressOffset.value = targetOffset
    } else {
      progressOffset.value = withTiming(targetOffset, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    }
  }, [progress, reducedMotion])

  const baseCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }))

  const progressCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: progressOffset.value,
  }))

  return (
    <View style={styles.container}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
        {/* Track ring — faint copper */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={COLORS.copper}
          strokeWidth={3}
          strokeOpacity={0.18}
          fill="none"
        />

        {/* Draw-in ring — full copper sweep that animates on mount */}
        <AnimatedCircle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={COLORS.copper}
          strokeWidth={3}
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={baseCircleProps}
          fill="none"
          strokeLinecap="round"
          // Rotate so the ring starts at the top (12 o'clock)
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
        />

        {/* Progress overlay — gold arc driven by confirmed items */}
        {progress > 0 && (
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={COLORS.gold}
            strokeWidth={4}
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={progressCircleProps}
            fill="none"
            strokeLinecap="round"
            strokeOpacity={0.85}
            rotation="-90"
            origin={`${CENTER}, ${CENTER}`}
          />
        )}
      </Svg>

      {/* Gold confirmation gradient fill */}
      {allConfirmed && (
        <LinearGradient
          colors={[COLORS.gold + '40', COLORS.copper + '30', COLORS.gold + '20']}
          style={styles.gradientFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      )}

      {/* Glow layer via shadow */}
      <View style={[styles.glowRing, allConfirmed && styles.glowRingConfirmed]} />

      {/* Children rendered in centre of ring */}
      <View style={styles.content}>{children}</View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RING_SIZE / 2,
    margin: CENTER - RADIUS + 3,
  },
  glowRing: {
    position: 'absolute',
    width: RADIUS * 2 + 6,
    height: RADIUS * 2 + 6,
    borderRadius: RADIUS + 3,
    borderWidth: 3,
    borderColor: COLORS.copper,
    shadowColor: COLORS.copper,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    opacity: 0.6,
  },
  glowRingConfirmed: {
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowRadius: 28,
    opacity: 1,
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: RADIUS * 2 - 24,
    height: RADIUS * 2 - 24,
  },
})
