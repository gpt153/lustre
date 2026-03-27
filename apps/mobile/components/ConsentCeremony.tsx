/**
 * ConsentCeremony
 *
 * Full-screen overlay that transforms the consent flow into a shared moment
 * between two users.
 *
 * Layout (top → bottom):
 *   ┌──────────────────────────┐
 *   │   Warm charcoal backdrop │
 *   │   ┌────────────────┐     │
 *   │   │  ConsentRing   │     │
 *   │   │  + partner     │     │
 *   │   │    avatar      │     │
 *   │   └────────────────┘     │
 *   │   ConsentItem × 3        │
 *   │   [Bekräfta alla] button │
 *   └──────────────────────────┘
 *
 * States:
 *  - partnerAbsent  — partner has not opened the ceremony yet (avatar pulse)
 *  - inProgress     — both present, items being toggled
 *  - allConfirmed   — gold fill + haptic success + confirmation burst flash
 *  - exiting        — ring scales up + fades out
 *
 * Wave 2c SkiaParticles note:
 *   Particle burst is implemented as a simple opacity flash until the
 *   SkiaParticles component from Wave 2c is available.
 *
 * Reduced-motion:
 *   Ring appears instantly, items appear all at once, burst is a static
 *   gold fill. Haptics still fire.
 */

import React, { useCallback, useEffect, useRef } from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { X } from 'phosphor-react-native'
import { COLORS } from '@/constants/tokens'
import { SPRING, REDUCED_MOTION, TIMING } from '@/constants/animations'
import { ConsentRing } from './ConsentRing'
import { ConsentItem } from './ConsentItem'
import { useConsentCeremony } from '@/hooks/useConsentCeremony'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ConsentCeremonyProps {
  visible: boolean
  partnerId: string
  partnerName: string
  /** Optional avatar URI for the partner. */
  partnerAvatarUri?: string
  onConfirmed: () => void
  onDismiss: () => void
}

// ---------------------------------------------------------------------------
// Stagger interval between item entrances (ms)
// ---------------------------------------------------------------------------
const ITEM_STAGGER = 400

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConsentCeremony({
  visible,
  partnerId,
  partnerName,
  partnerAvatarUri,
  onConfirmed,
  onDismiss,
}: ConsentCeremonyProps) {
  const reducedMotion = useReducedMotion()
  const hasHapticFired = useRef(false)

  // ---------------------------------------------------------------------------
  // State hook
  // ---------------------------------------------------------------------------

  const { items, allConfirmedByMe, allConfirmedByThem, allConfirmed, partnerPresent, confirmItem, confirmAll } =
    useConsentCeremony({
      partnerId,
      partnerName,
      onAllConfirmed: onConfirmed,
    })

  // ---------------------------------------------------------------------------
  // Animation shared values
  // ---------------------------------------------------------------------------

  // Backdrop
  const backdropOpacity = useSharedValue(0)

  // Content card
  const contentScale = useSharedValue(0.92)
  const contentOpacity = useSharedValue(0)

  // Partner avatar pulse (when not yet present)
  const avatarScale = useSharedValue(1)

  // Confirmation burst flash (replaces SkiaParticles until Wave 2c lands)
  const burstOpacity = useSharedValue(0)

  // Exit animation
  const exitScale = useSharedValue(1)
  const exitOpacity = useSharedValue(1)

  // ---------------------------------------------------------------------------
  // Mount / unmount animations
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!visible) return

    hasHapticFired.current = false

    backdropOpacity.value = withTiming(1, { duration: TIMING.medium })

    if (reducedMotion) {
      contentScale.value = 1
      contentOpacity.value = 1
      exitScale.value = 1
      exitOpacity.value = 1
    } else {
      contentScale.value = withSpring(1, SPRING.gentle)
      contentOpacity.value = withTiming(1, { duration: TIMING.medium })
      exitScale.value = 1
      exitOpacity.value = 1
    }
  }, [visible, reducedMotion])

  // ---------------------------------------------------------------------------
  // Partner absence pulse
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (partnerPresent || reducedMotion) {
      avatarScale.value = 1
      return
    }

    avatarScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
    )
  }, [partnerPresent, reducedMotion])

  // ---------------------------------------------------------------------------
  // Confirmation burst + haptics
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!allConfirmed || hasHapticFired.current) return

    hasHapticFired.current = true

    // Haptic success pattern
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    if (reducedMotion) {
      // Static gold fill — just keep burstOpacity at 1
      burstOpacity.value = 1
    } else {
      // Flash burst: opacity 0 → 1 → 0 (twice for sparkle feel)
      burstOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 250 }),
        withDelay(100, withTiming(0.7, { duration: 150 })),
        withTiming(0, { duration: 400 }),
      )
    }
  }, [allConfirmed, reducedMotion])

  // ---------------------------------------------------------------------------
  // Exit animation
  // ---------------------------------------------------------------------------

  const handleDismiss = useCallback(() => {
    if (reducedMotion) {
      onDismiss()
      return
    }

    exitScale.value = withTiming(1.2, { duration: 300 })
    exitOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) runOnJS(onDismiss)()
    })
    backdropOpacity.value = withTiming(0, { duration: 300 })
    contentOpacity.value = withTiming(0, { duration: 200 })
  }, [reducedMotion, onDismiss])

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const progress =
    items.length === 0
      ? 0
      : items.filter((i: { confirmedByMe: boolean; confirmedByThem: boolean }) => i.confirmedByMe && i.confirmedByThem).length / items.length

  // ---------------------------------------------------------------------------
  // Animated styles
  // ---------------------------------------------------------------------------

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value * exitOpacity.value,
    transform: [
      { scale: contentScale.value * exitScale.value },
    ],
  }))

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }))

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
  }))

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>

        {/* Dismiss button */}
        <Pressable
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Stäng samtycke"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={22} color={COLORS.warmWhite} weight="bold" />
        </Pressable>

        {/* Content card */}
        <Animated.View style={[styles.card, contentStyle]}>

          {/* Title */}
          <Text style={styles.title}>Samtycke</Text>
          <Text style={styles.subtitle}>
            {allConfirmed
              ? 'Ni har båda bekräftat'
              : partnerPresent
              ? `${partnerName} är redo`
              : `Väntar på ${partnerName}…`}
          </Text>

          {/* Ring + partner avatar */}
          <View style={styles.ringWrap}>
            <ConsentRing progress={progress} allConfirmed={allConfirmed}>
              {/* Partner avatar inside ring centre */}
              {partnerAvatarUri ? (
                <Animated.View style={[styles.avatarWrap, avatarStyle]}>
                  <Image
                    source={{ uri: partnerAvatarUri }}
                    style={[
                      styles.avatar,
                      !partnerPresent && styles.avatarAbsent,
                    ]}
                    accessibilityLabel={`${partnerName}s profilbild`}
                  />
                  {!partnerPresent && (
                    <View style={styles.avatarPulseDot} />
                  )}
                </Animated.View>
              ) : (
                <Animated.View style={[styles.avatarPlaceholder, avatarStyle]}>
                  <Text style={styles.avatarInitial}>
                    {partnerName.charAt(0).toUpperCase()}
                  </Text>
                </Animated.View>
              )}
            </ConsentRing>

            {/* Confirmation burst flash — will be replaced by SkiaParticles (Wave 2c) */}
            {/* For now: simple gold opacity flash over the ring area */}
            <Animated.View
              style={[StyleSheet.absoluteFill, styles.burstFlash, burstStyle]}
              pointerEvents="none"
            />
          </View>

          {/* Consent items */}
          <View style={styles.itemsContainer}>
            {items.map((item: any, index: number) => (
              <ConsentItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                confirmedByMe={item.confirmedByMe}
                confirmedByThem={item.confirmedByThem}
                delay={reducedMotion ? 0 : index * ITEM_STAGGER}
                onToggle={confirmItem}
              />
            ))}
          </View>

          {/* Confirm all button — only shown until all items are confirmed by me */}
          {!allConfirmedByMe && (
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.confirmButtonPressed,
              ]}
              onPress={confirmAll}
              accessibilityRole="button"
              accessibilityLabel="Bekräfta alla samtyckespunkter"
            >
              <LinearGradient
                colors={[COLORS.gold, COLORS.copper]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>Bekräfta alla</Text>
              </LinearGradient>
            </Pressable>
          )}

          {/* Waiting for them message */}
          {allConfirmedByMe && !allConfirmedByThem && (
            <Text style={styles.waitingText}>
              Väntar på att {partnerName} bekräftar…
            </Text>
          )}

          {/* Success message */}
          {allConfirmed && (
            <Text style={styles.successText}>
              Ni är redo för varandra
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(44,36,33,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    color: COLORS.warmWhite,
    fontSize: 26,
    fontFamily: 'GeneralSans-Semibold',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.copperLight,
    fontSize: 15,
    fontFamily: 'Inter',
    marginBottom: 28,
    letterSpacing: 0.2,
  },
  ringWrap: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.copper,
  },
  avatarAbsent: {
    opacity: 0.55,
    borderColor: COLORS.warmGray,
  },
  avatarPulseDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.charcoal,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.charcoal,
    borderWidth: 2,
    borderColor: COLORS.copper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: COLORS.copper,
    fontSize: 32,
    fontFamily: 'GeneralSans-Semibold',
  },
  burstFlash: {
    borderRadius: 160,
    backgroundColor: COLORS.gold,
    margin: 20,
  },
  itemsContainer: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  confirmButton: {
    width: '80%',
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 4,
  },
  confirmButtonPressed: {
    opacity: 0.85,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: COLORS.charcoal,
    fontSize: 17,
    fontFamily: 'GeneralSans-Semibold',
    letterSpacing: 0.3,
  },
  waitingText: {
    color: COLORS.copperMuted,
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    letterSpacing: 0.1,
  },
  successText: {
    color: COLORS.gold,
    fontSize: 17,
    fontFamily: 'GeneralSans-Medium',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 0.3,
  },
})
