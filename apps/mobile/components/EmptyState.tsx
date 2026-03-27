import React, { useEffect } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { COLORS, SPACING } from '@/constants/tokens'
import { SPRING } from '@/constants/animations'
import { ILLUSTRATIONS, IllustrationKey } from './illustrations'

interface Action {
  label: string
  onPress: () => void
}

interface EmptyStateProps {
  illustration: IllustrationKey
  title: string
  description: string
  action?: Action
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
}: EmptyStateProps) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  useEffect(() => {
    opacity.value = withSpring(1, SPRING.gentle)
    translateY.value = withSpring(0, SPRING.gentle)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  const IllustrationComponent = ILLUSTRATIONS[illustration]

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.illustrationWrapper} accessible={false}>
        <IllustrationComponent size={120} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {action ? (
        <TouchableOpacity
          style={styles.button}
          onPress={action.onPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={styles.buttonLabel}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  illustrationWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    color: COLORS.charcoal,
    textAlign: 'center',
  },
  description: {
    fontWeight: '400',
    fontSize: 14,
    color: COLORS.charcoal,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 4,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: COLORS.copper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 15,
    color: COLORS.warmWhite,
    letterSpacing: 0.2,
  },
})
