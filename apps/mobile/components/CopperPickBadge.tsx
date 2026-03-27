/**
 * CopperPickBadge
 *
 * Copper pill badge shown at the top-left of the Copper Pick card.
 *
 * Features:
 *   - Copper (#B87333) pill background with expo-blur BlurView behind it
 *   - Phosphor Star icon (fill weight) + "Copper Pick" label
 *   - Reanimated glow pulse: shadowRadius oscillates 0 ↔ 8 on repeat
 *   - Entrance animation driven by external translateX shared value
 */

import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { Star } from 'phosphor-react-native'
import { COLORS, SPACING } from '@/constants/tokens'
import { SPRING } from '@/constants/animations'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CopperPickBadgeProps {
  /** Shared value controlling horizontal entrance slide (start at -100, animate to 0). */
  translateX: ReturnType<typeof useSharedValue<number>>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CopperPickBadge({ translateX }: CopperPickBadgeProps) {
  // Glow pulse: shadowRadius goes 0 → 8 → 0 → … endlessly
  const glowRadius = useSharedValue(0)
  const glowOpacity = useSharedValue(0)

  useEffect(() => {
    // Fade glow in at 600 ms (handled by parent entrance sequence via opacity)
    glowRadius.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 1500 }),
        withTiming(0, { duration: 1500 }),
      ),
      -1,
    )
  }, [glowRadius])

  const badgeEntranceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    shadowRadius: glowRadius.value,
    shadowOpacity: glowRadius.value > 0 ? 0.7 : 0,
    shadowColor: COLORS.copper,
    shadowOffset: { width: 0, height: 0 },
    elevation: glowRadius.value,
  }))

  return (
    <Animated.View style={[styles.wrapper, badgeEntranceStyle, glowStyle]}>
      {/* Blur background behind the pill */}
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Pill content */}
      <View style={styles.pill}>
        <Star size={14} weight="fill" color="#FFFFFF" />
        <Text style={styles.label}>Copper Pick</Text>
      </View>
    </Animated.View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.copper,
    // iOS shadow base — animated values layered on top via glowStyle
    shadowColor: COLORS.copper,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm + 2,
  },
  label: {
    fontSize: 12,
    fontFamily: 'GeneralSans-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
})
