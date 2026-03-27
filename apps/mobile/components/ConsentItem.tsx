/**
 * ConsentItem
 *
 * A single consent line item: phosphor-react-native icon + label text +
 * animated toggle.
 *
 * Entrance animation: fade + translateY driven by Reanimated, staggered by
 * the caller via the `delay` prop.
 *
 * Toggle: Reanimated spring animates the knob position and track colour.
 *
 * Reduced-motion: items appear instantly, toggle still animates (spring is
 * instant via REDUCED_MOTION.spring).
 */

import React, { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Shield, Heart, Lock, CheckCircle } from 'phosphor-react-native'
import { COLORS } from '@/constants/tokens'
import { SPRING, REDUCED_MOTION } from '@/constants/animations'
import { ConsentItemIcon } from '@/hooks/useConsentCeremony'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ConsentItemProps {
  id: string
  label: string
  icon: ConsentItemIcon
  /** Whether the local user has confirmed this item. */
  confirmedByMe: boolean
  /** Whether the remote partner has confirmed this item. */
  confirmedByThem: boolean
  /** Stagger delay in ms (index * 400). */
  delay: number
  onToggle: (id: string, value: boolean) => void
}

// ---------------------------------------------------------------------------
// Icon helper
// ---------------------------------------------------------------------------

function ItemIcon({ name, active }: { name: ConsentItemIcon; active: boolean }) {
  const color = active ? COLORS.gold : COLORS.copper
  const size = 22
  switch (name) {
    case 'shield':
      return <Shield size={size} color={color} weight={active ? 'fill' : 'regular'} />
    case 'heart':
      return <Heart size={size} color={color} weight={active ? 'fill' : 'regular'} />
    case 'lock':
      return <Lock size={size} color={color} weight={active ? 'fill' : 'regular'} />
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConsentItem({
  id,
  label,
  icon,
  confirmedByMe,
  confirmedByThem,
  delay,
  onToggle,
}: ConsentItemProps) {
  const reducedMotion = useReducedMotion()

  // Entrance animation
  const opacity = useSharedValue(reducedMotion ? 1 : 0)
  const translateY = useSharedValue(reducedMotion ? 0 : 16)

  // Toggle animation (0 = off, 1 = on)
  const toggleProgress = useSharedValue(confirmedByMe ? 1 : 0)

  // Partner confirmation glow (0 = not confirmed, 1 = confirmed)
  const partnerGlow = useSharedValue(confirmedByThem ? 1 : 0)

  useEffect(() => {
    if (reducedMotion) return
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }))
    translateY.value = withDelay(delay, withSpring(0, SPRING.default))
  }, [])

  useEffect(() => {
    const springConfig = reducedMotion ? REDUCED_MOTION.spring : SPRING.snappy
    toggleProgress.value = withSpring(confirmedByMe ? 1 : 0, springConfig)
  }, [confirmedByMe, reducedMotion])

  useEffect(() => {
    partnerGlow.value = withTiming(confirmedByThem ? 1 : 0, { duration: 400 })
  }, [confirmedByThem])

  // ---------------------------------------------------------------------------
  // Animated styles
  // ---------------------------------------------------------------------------

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      toggleProgress.value,
      [0, 1],
      [COLORS.charcoal + '60', COLORS.copper + 'CC'],
    ),
  }))

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: toggleProgress.value * 20,
      },
    ],
  }))

  const partnerIndicatorStyle = useAnimatedStyle(() => ({
    opacity: partnerGlow.value,
    transform: [{ scale: 0.8 + partnerGlow.value * 0.2 }],
  }))

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Icon */}
      <View style={styles.iconWrap}>
        <ItemIcon name={icon} active={confirmedByMe} />
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Partner confirmation indicator */}
      <Animated.View style={[styles.partnerIndicator, partnerIndicatorStyle]}>
        <CheckCircle size={14} color={COLORS.gold} weight="fill" />
      </Animated.View>

      {/* Toggle */}
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: confirmedByMe }}
        onPress={() => onToggle(id, !confirmedByMe)}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      >
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.knob, knobStyle]} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  iconWrap: {
    width: 30,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    color: COLORS.warmWhite,
    fontSize: 16,
    fontFamily: 'Inter',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  partnerIndicator: {
    marginRight: 4,
  },
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.warmWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
})
