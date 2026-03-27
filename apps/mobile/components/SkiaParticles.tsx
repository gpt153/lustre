/**
 * SkiaParticles
 *
 * GPU-accelerated particle canvas for the Match Ceremony burst.
 * Renders Skia Circle elements — zero JS-thread overhead during animation.
 *
 * Props:
 *   count      — number of particles in each burst (default 60)
 *   centerX    — burst origin X in screen pixels
 *   centerY    — burst origin Y in screen pixels
 *   active     — when true, starts a new burst; false stops it
 *   direction  — 'outward' expands from center, 'inward' converges to center
 */

import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Canvas, Circle } from '@shopify/react-native-skia'
import { useFrameCallback } from 'react-native-reanimated'
import { useParticles } from '@/hooks/useParticles'

export interface SkiaParticlesProps {
  count?: number
  centerX: number
  centerY: number
  active: boolean
  direction?: 'outward' | 'inward'
  width: number
  height: number
}

export function SkiaParticles({
  count = 60,
  centerX,
  centerY,
  active,
  direction = 'outward',
  width,
  height,
}: SkiaParticlesProps) {
  const { particles, startBurst, stopBurst, stepFrame } = useParticles({ count })

  // Start/stop burst when active changes
  useEffect(() => {
    if (active) {
      startBurst(centerX, centerY)
    } else {
      stopBurst()
    }
  }, [active, centerX, centerY, startBurst, stopBurst])

  // Drive physics on every GPU frame — runs on the UI thread via Skia
  useFrameCallback(() => {
    stepFrame()
  })

  return (
    <Canvas style={[styles.canvas, { width, height }]} pointerEvents="none">
      {particles.map((p, i) => {
        // For 'inward' mode flip velocity direction so particles converge
        const x = direction === 'inward' ? centerX * 2 - p.x : p.x
        const y = direction === 'inward' ? centerY * 2 - p.y : p.y
        return (
          <Circle
            key={i}
            cx={x}
            cy={y}
            r={p.size}
            color={p.color}
            opacity={p.opacity}
          />
        )
      })}
    </Canvas>
  )
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
})
