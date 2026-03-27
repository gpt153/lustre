/**
 * ModeToggle — Animated vanilla/spicy toggle component
 *
 * Features:
 *  • Pill container with sliding thumb (withSpring, snappy config)
 *  • Sun (vanilla) / Flame (spicy) icons from phosphor-react-native
 *  • Icon crossfade via Reanimated opacity derived values
 *  • Copper glow pulse during transition (shadowRadius 0 → 12 → 0)
 *  • Reads/writes to existing modeStore; delegates animation to
 *    ModeTransformContext.toggleMode
 */

import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  interpolate,
  interpolateColor,
  useSharedValue,
} from 'react-native-reanimated'
import { Sun, Flame } from 'phosphor-react-native'
import { useModeStore } from '@lustre/app/src/stores/modeStore'
import { useModeTransformContext } from '@/components/ModeTransition'
import { COLORS } from '@/constants/tokens'

// ---------------------------------------------------------------------------
// Spring configs
// ---------------------------------------------------------------------------

/** Thumb slide — snappy, under 200 ms */
const THUMB_SPRING = { damping: 20, stiffness: 120, mass: 0.9 }

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const PILL_WIDTH = 72
const PILL_HEIGHT = 36
const THUMB_SIZE = 28
const THUMB_PADDING = (PILL_HEIGHT - THUMB_SIZE) / 2
const THUMB_TRAVEL = PILL_WIDTH - THUMB_SIZE - THUMB_PADDING * 2

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ModeToggleProps {
  /** Optional additional styles for the outer wrapper */
  style?: object
}

export function ModeToggle({ style }: ModeToggleProps) {
  const { mode, setMode } = useModeStore()
  const { modeProgress, toggleMode } = useModeTransformContext()

  const isSpicy = mode === 'spicy'

  const handlePress = () => {
    toggleMode(!isSpicy)
  }

  // -------------------------------------------------------------------------
  // Thumb position — slides from left (vanilla) to right (spicy)
  // -------------------------------------------------------------------------

  const thumbTranslateX = useDerivedValue(() =>
    withSpring(
      interpolate(modeProgress.value, [0, 1], [0, THUMB_TRAVEL]),
      THUMB_SPRING,
    ),
  )

  // -------------------------------------------------------------------------
  // Pill background color — vanilla copper-tinted → spicy accent
  // -------------------------------------------------------------------------

  const pillBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      modeProgress.value,
      [0, 1],
      [COLORS.warmCream, COLORS.ember],
    ),
  }))

  // -------------------------------------------------------------------------
  // Thumb background
  // -------------------------------------------------------------------------

  const thumbBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      modeProgress.value,
      [0, 1],
      [COLORS.copper, COLORS.ember],
    ),
  }))

  // -------------------------------------------------------------------------
  // Copper glow pulse — shadowRadius peaks at 0.5 progress (mid-transition)
  // -------------------------------------------------------------------------

  const glowStyle = useAnimatedStyle(() => {
    const glowRadius = interpolate(modeProgress.value, [0, 0.5, 1], [0, 12, 0])
    const glowOpacity = interpolate(modeProgress.value, [0, 0.5, 1], [0, 0.7, 0])
    return {
      shadowColor: COLORS.copper,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowOpacity,
      shadowRadius: glowRadius,
      elevation: interpolate(modeProgress.value, [0, 0.5, 1], [0, 8, 0]),
    }
  })

  // -------------------------------------------------------------------------
  // Icon opacities — crossfade between Sun and Flame
  // -------------------------------------------------------------------------

  const sunOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(modeProgress.value, [0, 0.4], [1, 0]),
  }))

  const flameOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(modeProgress.value, [0.6, 1], [0, 1]),
  }))

  // -------------------------------------------------------------------------
  // Thumb translation
  // -------------------------------------------------------------------------

  const thumbTranslateStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbTranslateX.value }],
  }))

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: isSpicy }}
      accessibilityLabel={isSpicy ? 'Spicy mode aktiv. Tryck för att byta till Vanilla.' : 'Vanilla mode aktiv. Tryck för att byta till Spicy.'}
      style={style}
    >
      <Animated.View style={[styles.pill, pillBgStyle, glowStyle]}>
        {/* Track icons */}
        <View style={styles.trackIcons} pointerEvents="none">
          <Animated.View style={sunOpacityStyle}>
            <Sun size={14} color={COLORS.charcoal} weight="fill" />
          </Animated.View>
          <Animated.View style={flameOpacityStyle}>
            <Flame size={14} color="#FDF8F3" weight="fill" />
          </Animated.View>
        </View>

        {/* Sliding thumb */}
        <Animated.View style={[styles.thumbContainer, thumbTranslateStyle]}>
          <Animated.View style={[styles.thumb, thumbBgStyle]}>
            {/* Active icon on thumb — crossfade */}
            <View style={styles.thumbIcon} pointerEvents="none">
              <Animated.View style={[StyleSheet.absoluteFill, styles.thumbIconInner, sunOpacityStyle]}>
                <Sun size={16} color="#FDF8F3" weight="fill" />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, styles.thumbIconInner, flameOpacityStyle]}>
                <Flame size={16} color="#FDF8F3" weight="fill" />
              </Animated.View>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  pill: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'visible',
    justifyContent: 'center',
  },
  trackIcons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THUMB_PADDING + 4,
  },
  thumbContainer: {
    position: 'absolute',
    left: THUMB_PADDING,
    top: THUMB_PADDING,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  thumbIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  thumbIconInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
