/**
 * ParticleField
 *
 * Ambient floating particles that drift slowly upward with a subtle sine-wave
 * horizontal wobble — like dust motes caught in warm light or distant fireflies.
 *
 * Design decisions:
 * - 20 particles by default (much fewer than SkiaParticles burst at 60).
 * - Each particle is assigned a random: x position, size, opacity, and speed
 *   once at mount time, stored in a ref to avoid React re-renders.
 * - Particles wrap: when one exits the top edge it reappears at the bottom
 *   with a freshly randomised x position.
 * - Animation is throttled to ~30 fps via a frame-skip counter.
 * - Reduced motion: static particles, no movement.
 */

import React, { useRef, useEffect, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { Canvas, Circle } from '@shopify/react-native-skia'
import { useFrameCallback, useReducedMotion } from 'react-native-reanimated'
import { useWindowDimensions } from 'react-native'
import { COLORS } from '@/constants/tokens'

export interface ParticleFieldProps {
  /** Number of ambient particles (default 20). */
  count?: number
  /**
   * Particle fill colour.
   * Defaults to copperLight at ~40 % opacity (#D4A57466).
   */
  color?: string
  /** [min, max] radius in pixels (default [2, 5]). */
  sizeRange?: [number, number]
  style?: StyleProp<ViewStyle>
}

// copperLight at ~40 % opacity as an 8-digit hex
const DEFAULT_COLOR = '#D4A57466'

interface AmbientParticle {
  /** Current x position in pixels */
  x: number
  /** Current y position in pixels */
  y: number
  /** Radius in pixels */
  r: number
  /** Opacity 0.2 – 0.6 */
  opacity: number
  /** Upward drift speed in pixels per frame at 60 fps */
  speed: number
  /** Phase offset for the sine wobble (0 – 2π) */
  phase: number
  /** Horizontal wobble amplitude in pixels */
  wobble: number
}

function createParticles(
  count: number,
  width: number,
  height: number,
  minR: number,
  maxR: number,
): AmbientParticle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    // Distribute initial y positions across the full height so the field
    // looks populated from the first frame.
    y: Math.random() * height,
    r: minR + Math.random() * (maxR - minR),
    opacity: 0.2 + Math.random() * 0.4,
    // Drift between 0.2 and 0.6 px/frame at 60 fps → very slow upward float
    speed: 0.2 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    // Subtle horizontal wobble: 1 – 4 px amplitude
    wobble: 1 + Math.random() * 3,
  }))
}

export function ParticleField({
  count = 20,
  color = DEFAULT_COLOR,
  sizeRange = [2, 5],
  style,
}: ParticleFieldProps) {
  const { width, height } = useWindowDimensions()
  const reducedMotion = useReducedMotion()

  const [minR, maxR] = sizeRange

  // All particle state lives in a ref so mutations don't trigger React renders.
  const particlesRef = useRef<AmbientParticle[]>([])
  // Frame counter used to tick the sine phase and throttle to ~30 fps.
  const frameRef = useRef(0)
  // Force Skia to repaint by bumping a shared value — we use a plain counter
  // and useState so the Canvas children array re-evaluates each frame.
  const [tick, setTick] = React.useState(0)

  // Initialise particles once (or when layout changes).
  useEffect(() => {
    if (width > 0 && height > 0) {
      particlesRef.current = createParticles(count, width, height, minR, maxR)
    }
  }, [count, width, height, minR, maxR])

  const stepFrame = useCallback(() => {
    if (reducedMotion) return

    frameRef.current += 1
    // Skip odd frames → ~30 fps throttle on a 60 Hz display
    if (frameRef.current % 2 !== 0) return

    const ps = particlesRef.current
    const time = frameRef.current * (1 / 60) // seconds elapsed

    for (const p of ps) {
      // Drift upward
      p.y -= p.speed

      // Sine-wave horizontal wobble
      p.x += Math.sin(time * 0.8 + p.phase) * 0.3 * p.wobble

      // Keep x within bounds with soft wrap
      if (p.x < -p.r) p.x = width + p.r
      if (p.x > width + p.r) p.x = -p.r

      // When particle exits the top, wrap to the bottom with a new random x
      if (p.y + p.r < 0) {
        p.y = height + p.r
        p.x = Math.random() * width
        // Re-randomise speed and phase for variety
        p.speed = 0.2 + Math.random() * 0.4
        p.phase = Math.random() * Math.PI * 2
      }
    }

    // Signal Skia to repaint
    setTick((n) => n + 1)
  }, [reducedMotion, width, height])

  useFrameCallback(stepFrame)

  const particles = particlesRef.current

  return (
    <Canvas
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    >
      {particles.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          color={color}
          opacity={p.opacity}
        />
      ))}
    </Canvas>
  )
}
