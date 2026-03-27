/**
 * GlassmorphismFrame
 *
 * A circular photo frame with a frosted-glass (BlurView) background,
 * copper border, and warm-white semi-transparent overlay.
 *
 * Used to display user avatars in the Match Ceremony.
 */

import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { COLORS } from '@/constants/tokens'

export interface GlassmorphismFrameProps {
  photoUrl: string
  size?: number
}

const FRAME_SIZE = 80
const BORDER_WIDTH = 3
const BLUR_PADDING = 8

export function GlassmorphismFrame({
  photoUrl,
  size = FRAME_SIZE,
}: GlassmorphismFrameProps) {
  const borderRadius = size / 2

  return (
    <BlurView
      intensity={60}
      tint="light"
      style={[
        styles.blurContainer,
        {
          width: size + BLUR_PADDING * 2,
          height: size + BLUR_PADDING * 2,
          borderRadius: borderRadius + BLUR_PADDING,
        },
      ]}
    >
      <View
        style={[
          styles.innerFrame,
          {
            width: size,
            height: size,
            borderRadius,
            borderColor: COLORS.copper,
          },
        ]}
      >
        <Image
          source={{ uri: photoUrl }}
          style={[styles.photo, { width: size - BORDER_WIDTH * 2, height: size - BORDER_WIDTH * 2, borderRadius: borderRadius - BORDER_WIDTH }]}
          resizeMode="cover"
        />
      </View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  blurContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(253,248,243,0.35)',
  },
  innerFrame: {
    borderWidth: BORDER_WIDTH,
    overflow: 'hidden',
    backgroundColor: 'rgba(253,248,243,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    // size set inline
  },
})
