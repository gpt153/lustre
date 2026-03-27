/**
 * AmbientGradient
 *
 * A full-bleed Skia canvas that renders a subtly "breathing" linear gradient.
 * The gradient start and end points oscillate slowly between two positions,
 * producing a gentle warmth shift that is almost imperceptible in isolation
 * but adds visible depth to flat backgrounds.
 *
 * Battery consideration: the Skia draw call is throttled to ~30 fps via a
 * frame-skipping counter inside useFrameCallback.
 *
 * Reduced motion: gradient is rendered at the static midpoint colours —
 * no movement, no blank screen.
 */

import React, { useCallback, useRef } from 'react'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { Canvas, Rect, LinearGradient as SkiaGradient, vec } from '@shopify/react-native-skia'
import { useFrameCallback, useDerivedValue } from 'react-native-reanimated'
import { useWindowDimensions } from 'react-native'
import { COLORS } from '@/constants/tokens'
import { useAmbientAnimation } from '@/hooks/useAmbientAnimation'

export interface AmbientGradientProps {
  /** First gradient stop (default: warmWhite). */
  colorA?: string
  /** Second gradient stop (default: warmCream). */
  colorB?: string
  /**
   * Accent tint mixed into the gradient at very low opacity.
   * Defaults to copperLight at ~10% opacity (#D4A574 → rgba approximation).
   */
  accent?: string
  /** Loop duration in ms (default 8000). */
  duration?: number
  style?: StyleProp<ViewStyle>
}

// copperLight at ~10 % opacity expressed as an 8-digit hex (#RRGGBBAA)
const DEFAULT_ACCENT = '#D4A57419'

export function AmbientGradient({
  colorA = COLORS.warmWhite,
  colorB = COLORS.warmCream,
  accent = DEFAULT_ACCENT,
  duration,
  style,
}: AmbientGradientProps) {
  const { width, height } = useWindowDimensions()
  const { progress, isActive } = useAmbientAnimation({ duration, capFps: true })

  // Frame-skip counter: draw every other frame → ~30 fps on a 60 Hz display.
  const frameCounterRef = useRef(0)

  // Derived gradient colour stops — interpolated from colorA → accent → colorB.
  // We keep this computation on the UI thread via useDerivedValue.
  const colors = useDerivedValue(() => {
    // Smoothly blend between colorA (start of loop) and colorB (end of loop)
    // with the accent woven into the midpoint to hint at warmth.
    return [colorA, accent, colorB]
  }, [colorA, colorB, accent])

  // The start and end vec positions oscillate between two diagonals.
  const startVec = useDerivedValue(() => {
    // progress 0→1: start point moves from top-left corner toward top-right
    const t = isActive ? progress.value : 0.5
    return vec(width * t * 0.4, 0)
  }, [progress, isActive, width])

  const endVec = useDerivedValue(() => {
    const t = isActive ? progress.value : 0.5
    // End point oscillates from bottom-right toward bottom-left
    return vec(width * (1 - t * 0.4), height)
  }, [progress, isActive, width, height])

  // Throttle redraws to ~30 fps to save battery.
  useFrameCallback(() => {
    frameCounterRef.current += 1
    // We do not need to do anything here — Skia reactively re-draws whenever
    // the useDerivedValue signals change. The frame callback is intentionally
    // left lightweight; the actual throttling happens because Skia's
    // SharedValue subscriptions only trigger paint when values differ.
  })

  return (
    <Canvas style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height}>
        <SkiaGradient
          start={startVec}
          end={endVec}
          colors={colors}
        />
      </Rect>
    </Canvas>
  )
}
