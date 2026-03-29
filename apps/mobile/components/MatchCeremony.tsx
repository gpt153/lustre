/**
 * MatchCeremony
 *
 * Fullscreen modal overlay shown when two users mutually match.
 * Two PolaroidCards spring in from opposite sides and overlap at ±8°.
 *
 * Animation sequence:
 *   1. Backdrop fades in (200ms)
 *   2. Both cards spring in simultaneously from off-screen (SPRING.bouncy)
 *   3. Title fades in (300ms delay)
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
  currentUserPhotoUrl: string
  matchedUserPhotoUrl: string
  matchedUserName?: string
  onSendMessage: () => void
  onContinueDiscovering: () => void
  onDismiss: () => void
}

// ---------------------------------------------------------------------------
// Design tokens (local)
// ---------------------------------------------------------------------------

const GOLD = '#D4A843'
const COPPER = '#894d0d'
const COPPER_LIGHT = '#a76526'
const CHARCOAL = '#2C2421'
const WARM_WHITE = '#fef8f3'

const CARD_WIDTH = 160
const CARD_ROTATION_LEFT = -8
const CARD_ROTATION_RIGHT = 8
// Horizontal offset so cards overlap at center
const CARD_OFFSET_X = 48

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
      withTiming(1, { duration: TIMING.medium })
    )

    // 4. Buttons fade in
    buttonsOpacity.value = withDelay(
      TIMING.medium + 100,
      withTiming(1, { duration: TIMING.medium })
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
    transform: [{ translateX: leftCardX.value - CARD_OFFSET_X }],
  }))

  const rightCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightCardX.value + CARD_OFFSET_X }],
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
        {/* Cards row */}
        <View style={styles.cardsRow} pointerEvents="none">
          {/* Left card — current user */}
          <Animated.View style={leftCardStyle}>
            <PolaroidCard
              cardWidth={CARD_WIDTH}
              imageSource={{ uri: currentUserPhotoUrl }}
              caption="Du"
              rotation={CARD_ROTATION_LEFT}
              shadow="lg"
            />
          </Animated.View>

          {/* Right card — matched user */}
          <Animated.View style={rightCardStyle}>
            <PolaroidCard
              cardWidth={CARD_WIDTH}
              imageSource={{ uri: matchedUserPhotoUrl }}
              caption={matchedUserName}
              rotation={CARD_ROTATION_RIGHT}
              shadow="lg"
            />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          It's a Match!
        </Animated.Text>

        {/* Buttons */}
        <Animated.View style={[styles.buttons, buttonsStyle]}>
          {/* Primary — send message */}
          <Pressable
            onPress={handleSendMessage}
            accessibilityRole="button"
            accessibilityLabel="Skicka meddelande"
          >
            <LinearGradient
              colors={[COPPER_LIGHT, COPPER]}
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
            style={styles.ghostButton}
            accessibilityRole="button"
            accessibilityLabel="Fortsätt upptäcka"
          >
            <Text style={styles.ghostButtonText}>Fortsätt upptäcka</Text>
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
    backgroundColor: `rgba(44, 36, 33, 0.85)`, // Charcoal 0.85
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Enough height to contain rotated cards comfortably
    height: 240,
    marginBottom: 32,
  },

  title: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 42,
    color: GOLD,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.5,
  },

  buttons: {
    width: '100%',
    gap: 12,
    alignItems: 'stretch',
  },

  primaryButton: {
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },

  primaryButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
    color: WARM_WHITE,
    letterSpacing: 0.3,
  },

  ghostButton: {
    borderRadius: 9999,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 195, 180, 0.35)',
  },

  ghostButtonText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: WARM_WHITE,
    letterSpacing: 0.3,
  },
})
