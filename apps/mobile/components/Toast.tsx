import * as React from 'react'
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import type { Toast as ToastData } from '@lustre/app'
import { SPRING, TIMING } from '@/constants/animations'
import { SPACING } from '@/constants/tokens'

// ---------------------------------------------------------------------------
// Variant config
// ---------------------------------------------------------------------------

type VariantConfig = {
  color: string
  bgColor: string
  indicator: string
}

const VARIANT_CONFIG: Record<ToastData['variant'], VariantConfig> = {
  success: {
    color: '#7A9E7E',
    bgColor: 'rgba(122, 158, 126, 0.15)',
    indicator: '✓',
  },
  error: {
    color: '#C85A3A',
    bgColor: 'rgba(200, 90, 58, 0.15)',
    indicator: '✕',
  },
  info: {
    color: '#B87333',
    bgColor: 'rgba(184, 115, 51, 0.15)',
    indicator: 'i',
  },
  warning: {
    color: '#D4A843',
    bgColor: 'rgba(212, 168, 67, 0.15)',
    indicator: '!',
  },
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, variant, message, action, duration } = toast
  const config = VARIANT_CONFIG[variant]

  // Shared values for animations — mutations run on UI thread via Reanimated
  const translateY = useSharedValue(-120)
  const opacity = useSharedValue(1)

  // Timer ref for auto-dismiss cleanup
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // JS-thread dismiss: clear timer, remove from store
  const dismiss = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    onDismiss(id)
  }, [id, onDismiss])

  // Animate out then dismiss — runs from JS thread
  const animateOut = React.useCallback(() => {
    translateY.value = withTiming(-120, { duration: TIMING.fast })
    opacity.value = withTiming(0, { duration: TIMING.fast }, (finished) => {
      'worklet'
      if (finished) {
        runOnJS(dismiss)()
      }
    })
  }, [translateY, opacity, dismiss])

  // Enter animation on mount
  React.useEffect(() => {
    // Spring slide in from top — runs on UI thread via Reanimated
    translateY.value = withSpring(0, { damping: 20, stiffness: 150, mass: 0.8 })

    // Announce for screen readers
    AccessibilityInfo.announceForAccessibility(message)

    // Auto-dismiss timer
    timerRef.current = setTimeout(() => {
      animateOut()
    }, duration)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Swipe-to-dismiss gesture (upward only, UI thread)
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet'
      // Clamp to only allow upward drag
      translateY.value = Math.min(0, e.translationY)
    })
    .onEnd((e) => {
      'worklet'
      if (e.velocityY < -500 || e.translationY < -50) {
        // Fast fling up or dragged far enough — dismiss
        translateY.value = withSpring(-200, SPRING.stiff)
        opacity.value = withTiming(0, { duration: TIMING.fast }, (finished) => {
          'worklet'
          if (finished) {
            runOnJS(dismiss)()
          }
        })
      } else {
        // Snap back to resting position
        translateY.value = withSpring(0, SPRING.snappy)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.container, animatedStyle]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <View
          style={[
            styles.toastBody,
            {
              backgroundColor: config.bgColor,
              borderLeftColor: config.color,
            },
          ]}
        >
          {/* Icon indicator — 20px colored circle with variant symbol */}
          <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
            <Text style={styles.iconText}>{config.indicator}</Text>
          </View>

          {/* Message */}
          <Text style={styles.message} numberOfLines={3}>
            {message}
          </Text>

          {/* Optional action button */}
          {action && (
            <Pressable
              onPress={() => {
                action.onPress()
                dismiss()
              }}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text style={[styles.actionLabel, { color: config.color }]}>
                {action.label}
              </Text>
            </Pressable>
          )}

          {/* Dismiss button */}
          <Pressable
            onPress={animateOut}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Stäng"
          >
            <Text style={[styles.closeButton, { color: config.color }]}>×</Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  toastBody: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderLeftWidth: 3,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
    // Subtle elevation shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#2C2421',
    fontWeight: '500',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 0,
  },
  closeButton: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '400',
    flexShrink: 0,
    opacity: 0.7,
  },
})
