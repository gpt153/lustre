/**
 * MatchCeremony
 *
 * Full-screen match overlay. Triggered when two users mutually like each other.
 *
 * Sequence:
 *   1. Breathing gradient background fades in (copper/gold/ember, 15% opacity)
 *   2. Skia particle burst from screen center (60 particles, copper + gold)
 *   3. Both avatar photos spring in from left/right
 *   4. "Det är en match!" text scales in with spring
 *   5. Haptics synchronized: light (t=0), medium (t=400ms), success (t=600ms)
 *   6. After 5s: CTAs appear ("Skicka meddelande", "Fortsätt upptäcka")
 *   7. Tap anywhere to skip directly to CTAs
 *   8. Auto-dismiss after 8s total
 *
 * Reduced motion: particles and gradient animation are skipped;
 *   static overlay with photos + text appears immediately.
 */

import React, { useCallback, useEffect, useRef } from 'react'
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '@/constants/tokens'
import { SPRING, TIMING } from '@/constants/animations'
import { GlassmorphismFrame } from './GlassmorphismFrame'
import { SkiaParticles } from './SkiaParticles'
import { useMatchCeremony } from '@/hooks/useMatchCeremony'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CENTER_X = SCREEN_WIDTH / 2
const CENTER_Y = SCREEN_HEIGHT / 2

export interface MatchCeremonyProps {
  visible: boolean
  currentUserPhotoUrl: string
  matchedUserPhotoUrl: string
  matchedUserName?: string
  onSendMessage: () => void
  onContinueDiscovering: () => void
  onDismiss: () => void
}

export function MatchCeremony({
  visible,
  currentUserPhotoUrl,
  matchedUserPhotoUrl,
  matchedUserName,
  onSendMessage,
  onContinueDiscovering,
  onDismiss,
}: MatchCeremonyProps) {
  const { state, startCeremony, skipCeremony, dismissCeremony } = useMatchCeremony()

  // Shared values for animated elements
  const overlayOpacity = useSharedValue(0)
  const gradientAngle = useSharedValue(0)
  const leftPhotoX = useSharedValue(-250)
  const rightPhotoX = useSharedValue(250)
  const textScale = useSharedValue(0.8)
  const textOpacity = useSharedValue(0)
  const ctasOpacity = useSharedValue(0)

  const hasStarted = useRef(false)

  const resetAnimations = useCallback(() => {
    overlayOpacity.value = 0
    gradientAngle.value = 0
    leftPhotoX.value = -250
    rightPhotoX.value = 250
    textScale.value = 0.8
    textOpacity.value = 0
    ctasOpacity.value = 0
  }, [ctasOpacity, gradientAngle, leftPhotoX, overlayOpacity, rightPhotoX, textOpacity, textScale])

  const runFastForward = useCallback(() => {
    cancelAnimation(leftPhotoX)
    cancelAnimation(rightPhotoX)
    cancelAnimation(textScale)
    cancelAnimation(textOpacity)
    cancelAnimation(ctasOpacity)
    cancelAnimation(gradientAngle)

    leftPhotoX.value = withSpring(0, SPRING.snappy)
    rightPhotoX.value = withSpring(0, SPRING.snappy)
    textScale.value = withSpring(1, SPRING.snappy)
    textOpacity.value = withTiming(1, { duration: TIMING.fast })
    ctasOpacity.value = withTiming(1, { duration: TIMING.fast })
  }, [ctasOpacity, gradientAngle, leftPhotoX, rightPhotoX, textOpacity, textScale])

  // Define handlers before the effects that reference them
  const handleDismiss = useCallback(() => {
    hasStarted.current = false
    dismissCeremony()
    onDismiss()
  }, [dismissCeremony, onDismiss])

  const handleSendMessage = useCallback(() => {
    handleDismiss()
    onSendMessage()
  }, [handleDismiss, onSendMessage])

  const handleContinue = useCallback(() => {
    handleDismiss()
    onContinueDiscovering()
  }, [handleDismiss, onContinueDiscovering])

  const handleSkip = useCallback(() => {
    skipCeremony()
    runFastForward()
  }, [skipCeremony, runFastForward])

  // Kick off ceremony animations when visible
  useEffect(() => {
    if (!visible || hasStarted.current) return
    if (state.phase === 'idle') {
      resetAnimations()
      overlayOpacity.value = withTiming(1, { duration: TIMING.medium })
      startCeremony()
      hasStarted.current = true
    }
  }, [visible, state.phase, overlayOpacity, resetAnimations, startCeremony])

  // React to phase and visibility transitions
  useEffect(() => {
    if (!visible) return

    if (state.photosVisible) {
      if (state.reducedMotion) {
        leftPhotoX.value = 0
        rightPhotoX.value = 0
      } else {
        leftPhotoX.value = withSpring(0, { damping: 20, stiffness: 90, mass: 1 })
        rightPhotoX.value = withSpring(0, { damping: 20, stiffness: 90, mass: 1 })
      }
    }

    if (state.textVisible) {
      if (state.reducedMotion) {
        textScale.value = 1
        textOpacity.value = 1
      } else {
        textScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 150 }))
        textOpacity.value = withDelay(200, withTiming(1, { duration: TIMING.fast }))
      }
    }

    if (state.ctasVisible) {
      ctasOpacity.value = withTiming(1, { duration: TIMING.medium })
    }

    if (state.phase === 'dismissed') {
      overlayOpacity.value = withTiming(0, { duration: TIMING.medium }, (finished) => {
        if (finished) runOnJS(handleDismiss)()
      })
    }
  }, [
    visible,
    state.photosVisible,
    state.textVisible,
    state.ctasVisible,
    state.phase,
    state.reducedMotion,
    leftPhotoX,
    rightPhotoX,
    textScale,
    textOpacity,
    ctasOpacity,
    overlayOpacity,
    handleDismiss,
  ])

  // Breathing gradient rotation
  useEffect(() => {
    if (!visible || state.reducedMotion) return
    if (state.phase === 'running' || state.phase === 'ctas_visible') {
      gradientAngle.value = withRepeat(
        withTiming(360, { duration: TIMING.ambient, easing: Easing.linear }),
        -1,
        false,
      )
    }
  }, [visible, state.phase, state.reducedMotion, gradientAngle])

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      hasStarted.current = false
      resetAnimations()
    }
  }, [visible, resetAnimations])

  // Gesture.Tap to skip ceremony
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleSkip)()
  })

  // Animated styles
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const gradientRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gradientAngle.value}deg` }],
  }))

  const leftPhotoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftPhotoX.value }],
  }))

  const rightPhotoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightPhotoX.value }],
  }))

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
    opacity: textOpacity.value,
  }))

  const ctasStyle = useAnimatedStyle(() => ({
    opacity: ctasOpacity.value,
  }))

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={[styles.container, overlayStyle]}>
          {/* Breathing gradient background — rotation driven by Reanimated on UI thread */}
          <Animated.View style={[styles.gradient, styles.gradientWrapper, gradientRotateStyle]}>
            <LinearGradient
              colors={[
                'rgba(184,115,51,0.15)',
                'rgba(212,168,67,0.15)',
                'rgba(200,90,58,0.15)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientInner}
            />
          </Animated.View>

          {/* Dark backdrop for legibility */}
          <View style={styles.backdrop} />

          {/* Particle burst — GPU thread, no JS overhead */}
          {!state.reducedMotion && (
            <SkiaParticles
              count={60}
              centerX={CENTER_X}
              centerY={CENTER_Y}
              active={state.particlesActive}
              direction="outward"
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
            />
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* Photos row */}
            <View style={styles.photosRow}>
              <Animated.View style={leftPhotoStyle}>
                <GlassmorphismFrame photoUrl={currentUserPhotoUrl} size={80} />
              </Animated.View>

              <View style={styles.heartSeparator}>
                <Text style={styles.heartEmoji}>♥</Text>
              </View>

              <Animated.View style={rightPhotoStyle}>
                <GlassmorphismFrame photoUrl={matchedUserPhotoUrl} size={80} />
              </Animated.View>
            </View>

            {/* Match text */}
            <Animated.View style={[styles.textContainer, textStyle]}>
              <Text style={styles.matchTitle}>Det är en match!</Text>
              {matchedUserName ? (
                <Text style={styles.matchSubtitle}>
                  Du och {matchedUserName} gillar varandra
                </Text>
              ) : null}
            </Animated.View>

            {/* CTAs */}
            <Animated.View style={[styles.ctasContainer, ctasStyle]}>
              <Pressable
                style={[styles.ctaButton, styles.ctaPrimary]}
                onPress={handleSendMessage}
                accessibilityRole="button"
                accessibilityLabel="Skicka meddelande"
              >
                <Text style={styles.ctaPrimaryText}>Skicka meddelande</Text>
              </Pressable>

              <Pressable
                style={[styles.ctaButton, styles.ctaGhost]}
                onPress={handleContinue}
                accessibilityRole="button"
                accessibilityLabel="Fortsätt upptäcka"
              >
                <Text style={styles.ctaGhostText}>Fortsätt upptäcka</Text>
              </Pressable>
            </Animated.View>

            {/* Skip hint — only during ceremony before CTAs */}
            {state.phase === 'running' && !state.ctasVisible && (
              <Text style={styles.skipHint}>Tryck var som helst för att hoppa över</Text>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientWrapper: {
    // oversized so rotation doesn't reveal edges
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_HEIGHT * 1.5,
    top: -(SCREEN_HEIGHT * 0.25),
    left: -(SCREEN_WIDTH * 0.25),
  },
  gradientInner: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,18,14,0.82)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heartSeparator: {
    width: 32,
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 24,
    color: COLORS.copper,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  matchTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 28,
    color: COLORS.copper,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  matchSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(253,248,243,0.75)',
    textAlign: 'center',
  },
  ctasContainer: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimary: {
    backgroundColor: COLORS.copper,
  },
  ctaPrimaryText: {
    fontFamily: 'GeneralSans-SemiBold',
    fontSize: 16,
    color: COLORS.warmWhite,
    letterSpacing: 0.3,
  },
  ctaGhost: {
    borderWidth: 1.5,
    borderColor: 'rgba(184,115,51,0.6)',
    backgroundColor: 'transparent',
  },
  ctaGhostText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 16,
    color: COLORS.copper,
    letterSpacing: 0.3,
  },
  skipHint: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'rgba(253,248,243,0.4)',
    textAlign: 'center',
    marginTop: 8,
  },
})
