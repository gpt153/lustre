import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Broadcast } from 'phosphor-react-native'
import * as Haptics from 'expo-haptics'
import { COLORS, SPACING } from '@/constants/tokens'
import { AnimatedPressable } from './AnimatedPressable'
import { useSpotlight } from '@/hooks/useSpotlight'

interface SpotlightActivateProps {
  style?: object
}

export function SpotlightActivate({ style }: SpotlightActivateProps) {
  const { credits, isActive, remainingSeconds, activate, isActivating } =
    useSpotlight()

  // Pulsing glow animation when active
  const pulseOpacity = useSharedValue(1)

  React.useEffect(() => {
    if (isActive) {
      pulseOpacity.value = withRepeat(
        withTiming(0.5, { duration: 1500 }),
        -1, // infinite
        true, // reverse
      )
    } else {
      pulseOpacity.value = 1
    }
  }, [isActive, pulseOpacity])

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }))

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleActivate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    try {
      await activate()
    } catch {
      // Error handled by mutation
    }
  }

  // Don't render if no credits and not active
  if (!isActive && credits === 0) return null

  if (isActive) {
    return (
      <Animated.View style={[styles.activeContainer, pulseStyle, style]}>
        <Broadcast size={18} weight="fill" color={COLORS.gold} />
        <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
      </Animated.View>
    )
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Aktivera Spotlight. ${credits} krediter.`}
      onPress={handleActivate}
      disabled={isActivating}
      style={[styles.activateButton, style]}
    >
      <Broadcast size={18} weight="fill" color={COLORS.warmWhite} />
      <Text style={styles.activateText}>Go Live</Text>
      <View style={styles.creditBadge}>
        <Text style={styles.creditText}>{credits}</Text>
      </View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 168, 67, 0.15)',
    paddingHorizontal: SPACING.sm + SPACING.xs,
    paddingVertical: SPACING.xs + 4,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
    fontVariant: ['tabular-nums'],
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.copper,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + SPACING.xs,
    borderRadius: 24,
    gap: SPACING.xs,
  },
  activateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.warmWhite,
  },
  creditBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  creditText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warmWhite,
  },
})
