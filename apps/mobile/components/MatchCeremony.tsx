/**
 * MatchCeremony
 *
 * Fullscreen modal overlay shown when two users mutually match.
 * Two PolaroidCards spring in from opposite sides and overlap at +/-8 degrees.
 * Design follows the Stitch mobile-match.html reference.
 *
 * Animation sequence:
 *   1. Backdrop fades in (200ms)
 *   2. Both cards spring in simultaneously from off-screen (SPRING.bouncy)
 *   3. Title + subtitle fade in (300ms delay)
 *   4. Buttons fade in (400ms delay)
 *   5. Haptic fires after cards land (~500ms)
 */

import React, { useCallback, useEffect } from 'react'
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { PolaroidCard } from '@lustre/ui'
import { SPRING, TIMING } from '@/constants/animations'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MatchCeremonyProps {
  visible: boolean
  currentUserName?: string
  currentUserPhotoUrl: string
  matchedUserPhotoUrl: string
  matchedUserName?: string
  onSendMessage: () => void
  onContinueDiscovering: () => void
  onDismiss: () => void
}

// ---------------------------------------------------------------------------
// Design tokens (matching Stitch mobile-match.html)
// ---------------------------------------------------------------------------

const TERTIARY = '#9f3c1e'
const COPPER = '#894d0d'
const COPPER_CONTAINER = '#a76526'
const CHARCOAL = '#2C2421'
const WARM_WHITE = '#FDF8F3'
const SURFACE_LOWEST = '#ffffff'
const ON_SURFACE_VARIANT = '#524439'

const CARD_WIDTH = 150
const CARD_ROTATION_LEFT = -8
const CARD_ROTATION_RIGHT = 8
const CARD_TRANSLATE_X = 32

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fireHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
    // Haptics unavailable — silent fail
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MatchCeremony({
  visible,
  currentUserName = 'Du',
  currentUserPhotoUrl,
  matchedUserPhotoUrl,
  matchedUserName = 'Match',
  onSendMessage,
  onContinueDiscovering,
  onDismiss,
}: MatchCeremonyProps) {
  const { width: screenWidth } = Dimensions.get('window')

  // Shared values
  const backdropOpacity = useSharedValue(0)
  const leftCardX = useSharedValue(-screenWidth)
  const rightCardX = useSharedValue(screenWidth)
  const titleOpacity = useSharedValue(0)
  const buttonsOpacity = useSharedValue(0)

  // ---------------------------------------------------------------------------
  // Animation entry
  // ---------------------------------------------------------------------------

  const runEntry = useCallback(() => {
    // 1. Backdrop
    backdropOpacity.value = withTiming(1, { duration: TIMING.fast })

    // 2. Cards spring in simultaneously
    leftCardX.value = withSpring(0, SPRING.bouncy)
    rightCardX.value = withSpring(0, SPRING.bouncy, (finished) => {
      if (finished) {
        // 5. Haptic fires after cards land
        runOnJS(fireHaptic)()
      }
    })

    // 3. Title fades in
    titleOpacity.value = withDelay(
      TIMING.medium,
      withTiming(1, { duration: TIMING.medium }),
    )

    // 4. Buttons fade in
    buttonsOpacity.value = withDelay(
      TIMING.medium + 100,
      withTiming(1, { duration: TIMING.medium }),
    )
  }, [backdropOpacity, leftCardX, rightCardX, titleOpacity, buttonsOpacity])

  // ---------------------------------------------------------------------------
  // Reset to hidden state
  // ---------------------------------------------------------------------------

  const resetValues = useCallback(() => {
    backdropOpacity.value = 0
    leftCardX.value = -screenWidth
    rightCardX.value = screenWidth
    titleOpacity.value = 0
    buttonsOpacity.value = 0
  }, [
    backdropOpacity,
    leftCardX,
    rightCardX,
    titleOpacity,
    buttonsOpacity,
    screenWidth,
  ])

  useEffect(() => {
    if (visible) {
      runEntry()
    } else {
      resetValues()
    }
  }, [visible, runEntry, resetValues])

  // ---------------------------------------------------------------------------
  // Animated styles
  // ---------------------------------------------------------------------------

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const leftCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftCardX.value - CARD_TRANSLATE_X }],
  }))

  const rightCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightCardX.value + CARD_TRANSLATE_X }],
  }))

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }))

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }))

  // ---------------------------------------------------------------------------
  // Button handlers — dismiss after action
  // ---------------------------------------------------------------------------

  const handleSendMessage = useCallback(() => {
    onDismiss()
    onSendMessage()
  }, [onDismiss, onSendMessage])

  const handleContinueDiscovering = useCallback(() => {
    onDismiss()
    onContinueDiscovering()
  }, [onDismiss, onContinueDiscovering])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* Backdrop — tap to dismiss */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      {/* Content — non-intercepting outer, inner blocks propagation */}
      <View style={styles.content} pointerEvents="box-none">
        {/* Headline section */}
        <Animated.View style={[styles.headlineSection, titleStyle]}>
          <Text style={styles.headline}>It's a connection!</Text>
          <Text style={styles.subtitle}>The start of something beautiful.</Text>
        </Animated.View>

        {/* Cards stack — overlapping polaroids */}
        <View style={styles.cardsContainer}>
          {/* Copper glow aura behind cards */}
          <View style={styles.copperGlow} />

          {/* Left card — current user */}
          <Animated.View style={[styles.cardLeft, leftCardStyle]}>
            <PolaroidCard
              cardWidth={CARD_WIDTH}
              imageSource={{ uri: currentUserPhotoUrl }}
              caption={currentUserName}
              rotation={CARD_ROTATION_LEFT}
              style={styles.polaroidShadowLeft}
            />
          </Animated.View>

          {/* Right card — matched user */}
          <Animated.View style={[styles.cardRight, rightCardStyle]}>
            <PolaroidCard
              cardWidth={CARD_WIDTH}
              imageSource={{ uri: matchedUserPhotoUrl }}
              caption={matchedUserName}
              rotation={CARD_ROTATION_RIGHT}
              style={styles.polaroidShadowRight}
            />
          </Animated.View>
        </View>

        {/* Buttons */}
        <Animated.View style={[styles.buttons, buttonsStyle]}>
          {/* Primary — send message */}
          <Pressable
            onPress={handleSendMessage}
            accessibilityRole="button"
            accessibilityLabel="Skicka meddelande"
            style={({ pressed }) => pressed && styles.buttonPressed}
          >
            <LinearGradient
              colors={[COPPER, COPPER_CONTAINER]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Skicka meddelande</Text>
            </LinearGradient>
          </Pressable>

          {/* Secondary — continue discovering */}
          <Pressable
            onPress={handleContinueDiscovering}
            style={({ pressed }) => [
              styles.outlinedButton,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Fortsätt utforska"
          >
            <Text style={styles.outlinedButtonText}>Fortsätt utforska</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 36, 33, 0.85)',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // -- Headline section --

  headlineSection: {
    alignItems: 'center',
    marginBottom: 48,
    gap: 8,
  },

  headline: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 36,
    color: TERTIARY,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: ON_SURFACE_VARIANT,
    textAlign: 'center',
    opacity: 0.8,
  },

  // -- Cards container --

  cardsContainer: {
    width: 320,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },

  copperGlow: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(137, 77, 13, 0.10)',
    // Blur is approximated by a large spread — RN doesn't support filter: blur
    // We use shadow to simulate the glow effect
    shadowColor: COPPER,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 80,
    elevation: 0,
  },

  cardLeft: {
    position: 'absolute',
    zIndex: 1,
  },

  cardRight: {
    position: 'absolute',
    zIndex: 2,
  },

  polaroidShadowLeft: {
    shadowColor: '#2E1500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },

  polaroidShadowRight: {
    shadowColor: '#2E1500',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 6,
  },

  // -- Buttons --

  buttons: {
    width: '100%',
    maxWidth: 380,
    gap: 12,
    alignItems: 'stretch',
    paddingHorizontal: 8,
  },

  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: 'rgba(137, 77, 13, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },

  primaryButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
    color: SURFACE_LOWEST,
    letterSpacing: 0.3,
  },

  outlinedButton: {
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(137, 77, 13, 0.20)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  outlinedButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
    color: COPPER,
    letterSpacing: 0.3,
  },

  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
})
