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
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING } from '@/constants/tokens'
import { SPRING } from '@/constants/animations'
import { ILLUSTRATIONS, IllustrationKey } from './illustrations'

interface Action {
  label: string
  onPress: () => void
}

interface EmptyStateProps {
  illustration?: IllustrationKey
  title: string
  description: string
  action?: Action
}

const COPPER = '#894d0d'
const COPPER_LIGHT = '#a76526'
const CHARCOAL = '#2C2421'
const SURFACE_CONTAINER_LOW = '#f7f3ef'

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

  const IllustrationComponent = illustration ? ILLUSTRATIONS[illustration] : null

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {IllustrationComponent ? (
        <View style={styles.illustrationWrapper} accessible={false}>
          <IllustrationComponent size={120} />
        </View>
      ) : (
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✦</Text>
        </View>
      )}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {action ? (
        <TouchableOpacity
          onPress={action.onPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <LinearGradient
            colors={[COPPER, COPPER_LIGHT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonLabel}>{action.label}</Text>
          </LinearGradient>
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
    backgroundColor: SURFACE_CONTAINER_LOW,
    borderRadius: 20,
    marginTop: 24,
    paddingVertical: SPACING.xl,
  },
  illustrationWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    backgroundColor: 'rgba(137, 77, 13, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  iconText: {
    fontSize: 28,
    color: '#894d0d',
  },
  title: {
    fontFamily: 'NotoSerif_700Bold',
    fontSize: 22,
    fontWeight: '700',
    color: CHARCOAL,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    fontFamily: 'Manrope_400Regular',
    fontWeight: '400',
    fontSize: 15,
    color: CHARCOAL,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 4,
    minHeight: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontWeight: '600',
    fontSize: 15,
    color: '#FDF8F3',
    letterSpacing: 0.2,
  },
})
