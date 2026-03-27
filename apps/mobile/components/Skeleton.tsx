/**
 * Skeleton Loader Component System
 *
 * Reanimated 3 shimmer animation running 100% on the UI thread.
 * Shimmer travels via translateX on an expo-linear-gradient masked
 * to the skeleton shapes using @react-native-masked-view/masked-view.
 *
 * Reduced motion: static warm gray fill, no animation.
 * Accessibility: accessibilityState={{ busy: true }}, accessibilityLabel="Loading"
 */

import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHIMMER_BASE = '#FDF8F3'        // warmWhite
const SHIMMER_HIGHLIGHT = 'rgba(184,115,51,0.1)'  // copper at 10%
const SKELETON_STATIC = '#E8DDD3'     // warm gray for reduced motion
const SHIMMER_DURATION = 1500         // 1.5 s cycle

// Default skeleton container width used to drive the translateX sweep
const SHIMMER_WIDTH = 400

// ---------------------------------------------------------------------------
// Internal: ShimmerOverlay — the animated gradient behind the mask
// ---------------------------------------------------------------------------

function ShimmerOverlay({ width = SHIMMER_WIDTH }: { width?: number }) {
  const translateX = useSharedValue(-width)

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, { duration: SHIMMER_DURATION, easing: Easing.linear }),
      -1,
      false,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <LinearGradient
        colors={[SHIMMER_BASE, SHIMMER_HIGHLIGHT, SHIMMER_BASE]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: width * 2, height: '100%' }}
      />
    </Animated.View>
  )
}

// ---------------------------------------------------------------------------
// Internal: SkeletonMask — combines a mask element with the shimmer
// ---------------------------------------------------------------------------

interface SkeletonMaskProps {
  children: React.ReactElement
  width?: number
}

function SkeletonMask({ children, width }: SkeletonMaskProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    // Return the mask element with static fill — no animation
    return React.cloneElement(children, {
      style: [children.props.style, { backgroundColor: SKELETON_STATIC }],
      accessibilityState: { busy: true },
      accessibilityLabel: 'Loading',
    })
  }

  return (
    <MaskedView
      maskElement={children}
      accessibilityState={{ busy: true }}
      accessibilityLabel="Loading"
    >
      {/* Background fill visible through mask */}
      <View style={[children.props.style, { backgroundColor: SHIMMER_BASE }]} />
      <ShimmerOverlay width={width} />
    </MaskedView>
  )
}

// ---------------------------------------------------------------------------
// Skeleton.Box
// ---------------------------------------------------------------------------

interface BoxProps {
  width: number | string
  height: number
  borderRadius?: number
  style?: object
}

function Box({ width, height, borderRadius = 8, style }: BoxProps) {
  const maskStyle = {
    width: width as number,
    height,
    borderRadius,
    backgroundColor: SHIMMER_BASE,
  }

  return (
    <SkeletonMask
      width={typeof width === 'number' ? width : SHIMMER_WIDTH}
    >
      <View style={[maskStyle, style]} />
    </SkeletonMask>
  )
}

// ---------------------------------------------------------------------------
// Skeleton.Text
// ---------------------------------------------------------------------------

// Predefined line widths as a fraction of container width for natural look
const LINE_WIDTH_FRACTIONS = [1.0, 0.85, 0.92, 0.70, 0.80]

interface TextProps {
  lines?: number
  lineHeight?: number
  lineSpacing?: number
  containerWidth?: number
  style?: object
}

function Text({
  lines = 2,
  lineHeight = 14,
  lineSpacing = 8,
  containerWidth = 240,
  style,
}: TextProps) {
  const clampedLines = Math.min(Math.max(lines, 1), 5)

  return (
    <View style={[{ gap: lineSpacing }, style]}>
      {Array.from({ length: clampedLines }).map((_, index) => {
        const fraction = LINE_WIDTH_FRACTIONS[index % LINE_WIDTH_FRACTIONS.length]
        // Last line is always shorter for realism
        const isLast = index === clampedLines - 1 && clampedLines > 1
        const lineWidth = Math.round(containerWidth * (isLast ? 0.55 : fraction))

        return (
          <Box
            key={index}
            width={lineWidth}
            height={lineHeight}
            borderRadius={4}
          />
        )
      })}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Skeleton.Circle
// ---------------------------------------------------------------------------

interface CircleProps {
  diameter: number
  style?: object
}

function Circle({ diameter, style }: CircleProps) {
  return (
    <Box
      width={diameter}
      height={diameter}
      borderRadius={diameter / 2}
      style={style}
    />
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const Skeleton = {
  Box,
  Text,
  Circle,
} as const
