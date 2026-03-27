/**
 * PaperGrain
 *
 * A static, paper-like noise texture overlay that adds tactile depth to flat
 * backgrounds without any animation cost. The fractal noise shader is rendered
 * once by the GPU — zero CPU usage after the initial draw.
 *
 * Implementation notes:
 * - Uses Skia's built-in FractalNoise shader applied to a full-bleed Rect.
 * - The Rect uses a Paint that blends the noise at very low opacity so the
 *   underlying content shows through cleanly.
 * - pointerEvents="none" ensures the overlay never intercepts touches.
 * - No reduced-motion check required — this component is always static.
 */

import React from 'react'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { Canvas, Rect, Paint, FractalNoise } from '@shopify/react-native-skia'
import { useWindowDimensions } from 'react-native'

export interface PaperGrainProps {
  /**
   * Overall grain opacity (0 – 1).
   * Default 0.04 — barely visible but adds perceivable texture.
   */
  opacity?: number
  style?: StyleProp<ViewStyle>
}

export function PaperGrain({ opacity = 0.04, style }: PaperGrainProps) {
  const { width, height } = useWindowDimensions()

  return (
    <Canvas
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    >
      <Rect x={0} y={0} width={width} height={height}>
        <Paint opacity={opacity}>
          {/*
           * FractalNoise parameters:
           *   freqX / freqY — spatial frequency; higher = finer grain
           *   octaves       — detail layers; 4 gives a good paper texture
           *   seed          — deterministic noise pattern
           */}
          <FractalNoise
            freqX={0.65}
            freqY={0.65}
            octaves={4}
            seed={42}
          />
        </Paint>
      </Rect>
    </Canvas>
  )
}
