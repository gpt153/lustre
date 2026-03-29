/**
 * PaperTextureBackground
 *
 * A lightweight wrapper component that provides the warm-white paper
 * background (#FDF8F3) with an optional subtle noise texture overlay.
 *
 * The noise is rendered via the existing PaperGrain Skia component at
 * very low opacity (0.03–0.05), matching the Stitch reference designs'
 * `.paper-texture` CSS class which uses fractalNoise at 0.05 opacity.
 *
 * Usage:
 *   <PaperTextureBackground>
 *     <YourScreenContent />
 *   </PaperTextureBackground>
 *
 * Performance: PaperGrain is a single static GPU draw — zero ongoing
 * CPU cost. The wrapper itself is a plain View with absolute-fill overlay.
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { PaperGrain } from './PaperGrain'

const WARM_WHITE = '#FDF8F3'

export interface PaperTextureBackgroundProps {
  children: React.ReactNode
  /** Additional styles merged onto the container View. */
  style?: StyleProp<ViewStyle>
  /**
   * Noise grain opacity (0–1).
   * Default 0.04 — matches the Stitch reference paper-texture at ~5% opacity.
   */
  grainOpacity?: number
  /**
   * Whether to show the noise texture overlay.
   * Defaults to true. Set to false for a plain warm-white background.
   */
  showGrain?: boolean
}

export function PaperTextureBackground({
  children,
  style,
  grainOpacity = 0.04,
  showGrain = true,
}: PaperTextureBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {children}
      {showGrain && <PaperGrain opacity={grainOpacity} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WARM_WHITE,
  },
})
