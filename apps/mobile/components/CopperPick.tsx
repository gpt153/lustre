/**
 * CopperPick
 *
 * Fullscreen cinematic daily recommendation card for the Lustre discover screen.
 *
 * Design:
 *   - Fullscreen hero photo with Ken Burns zoom (reuses useKenBurns)
 *   - expo-linear-gradient overlay at bottom 40%
 *   - CopperPickBadge at top-left with entrance slide + glow pulse
 *   - Profile info: name (32px Bold), age, location, "Why you match" blurb
 *   - Action buttons: Like (Heart copper 64 px), Pass (X charcoal 56 px),
 *     "Visa profil" text link — centered row
 *   - No swipe gesture — buttons only per spec
 *
 * Entrance sequence (orchestrated with setTimeout):
 *   0 ms   — photo fades from black (opacity 0 → 1, 800 ms)
 *   200 ms — badge slides in from translateX -100 (withSpring SPRING.snappy)
 *   400 ms — text fades up from translateY +20 (withSpring SPRING.gentle)
 *   800 ms — haptic impact (Light)
 *
 * Fallback (no profile / loading):
 *   CheckBackTomorrow illustration with heading and time-until-tomorrow copy.
 */

import React, { useCallback, useEffect } from 'react'
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Heart, X } from 'phosphor-react-native'
import * as Haptics from 'expo-haptics'
import { COLORS, SPACING } from '@/constants/tokens'
import { SPRING } from '@/constants/animations'
import { AnimatedPressable } from './AnimatedPressable'
import { CopperPickBadge } from './CopperPickBadge'
import { CheckBackTomorrow } from './illustrations/CheckBackTomorrow'
import { useKenBurns } from '@/hooks/useKenBurns'
import type { CopperPickProfile } from '@/hooks/useCopperPick'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CopperPickProps {
  /** The Copper Pick profile to display. */
  profile: CopperPickProfile
  /** Called when the user taps the Like (Heart) button. */
  onLike: () => void
  /** Called when the user taps the Pass (X) button. */
  onPass: () => void
  /** Called when the user taps "Visa profil". */
  onViewProfile: () => void
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function CopperPickEmpty() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const msUntilTomorrow = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(msUntilTomorrow / (1000 * 60 * 60))
  const minutes = Math.floor((msUntilTomorrow % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <View style={emptyStyles.container}>
      <CheckBackTomorrow size={140} />
      <Text style={emptyStyles.heading}>Kolla tillbaka imorgon</Text>
      <Text style={emptyStyles.subtitle}>
        Din nästa Copper Pick visas om{' '}
        <Text style={emptyStyles.timeHighlight}>
          {hours}h {minutes}m
        </Text>
      </Text>
    </View>
  )
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warmWhite,
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'GeneralSans-Bold',
    color: COLORS.charcoal,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: COLORS.warmGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  timeHighlight: {
    color: COLORS.copper,
    fontFamily: 'GeneralSans-SemiBold',
  },
})

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CopperPick({
  profile,
  onLike,
  onPass,
  onViewProfile,
}: CopperPickProps) {
  // Ken Burns on the hero photo — always active while this card is shown
  const { kenBurnsStyle } = useKenBurns(true)

  // --- Entrance shared values ---
  const photoOpacity = useSharedValue(0)
  const badgeTranslateX = useSharedValue(-100)
  const textTranslateY = useSharedValue(20)
  const textOpacity = useSharedValue(0)

  // Run entrance sequence once on mount
  useEffect(() => {
    // 0 ms — photo fades in
    photoOpacity.value = withTiming(1, { duration: 800 })

    // 200 ms — badge slides in
    const badgeTimer = setTimeout(() => {
      badgeTranslateX.value = withSpring(0, SPRING.snappy)
    }, 200)

    // 400 ms — text fades up
    const textTimer = setTimeout(() => {
      textTranslateY.value = withSpring(0, SPRING.gentle)
      textOpacity.value = withTiming(1, { duration: 300 })
    }, 400)

    // 800 ms — haptic feedback signals entrance complete
    const hapticTimer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, 800)

    return () => {
      clearTimeout(badgeTimer)
      clearTimeout(textTimer)
      clearTimeout(hapticTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Animated styles ---
  const photoStyle = useAnimatedStyle(() => ({
    opacity: photoOpacity.value,
  }))

  const textContainerStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }))

  // --- Action handlers (dismiss side-effect handled by parent) ---
  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onLike()
  }, [onLike])

  const handlePass = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPass()
  }, [onPass])

  const heroPhoto = profile.photos?.[0]

  if (!heroPhoto) {
    return <CopperPickEmpty />
  }

  const heroUri = heroPhoto.thumbnailLarge ?? heroPhoto.url

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------------------------ */}
      {/* Hero photo with Ken Burns                                           */}
      {/* ------------------------------------------------------------------ */}
      <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, kenBurnsStyle]}>
          <Image
            source={{ uri: heroUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </Animated.View>
      </Animated.View>

      {/* ------------------------------------------------------------------ */}
      {/* Gradient overlay — bottom 40%                                       */}
      {/* ------------------------------------------------------------------ */}
      <LinearGradient
        colors={['transparent', 'rgba(44,36,33,0.6)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />

      {/* ------------------------------------------------------------------ */}
      {/* Badge — top-left                                                    */}
      {/* ------------------------------------------------------------------ */}
      <View style={styles.badgeContainer} pointerEvents="none">
        <CopperPickBadge translateX={badgeTranslateX} />
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Profile info overlay — bottom                                       */}
      {/* ------------------------------------------------------------------ */}
      <Animated.View style={[styles.infoContainer, textContainerStyle]} pointerEvents="none">
        <Text style={styles.nameText} numberOfLines={1}>
          {profile.displayName}
          {profile.age ? `, ${profile.age}` : ''}
        </Text>
        {profile.location ? (
          <Text style={styles.locationText} numberOfLines={1}>
            {profile.location}
          </Text>
        ) : null}
        <Text style={styles.blurbText} numberOfLines={2}>
          {profile.whyYouMatch}
        </Text>
      </Animated.View>

      {/* ------------------------------------------------------------------ */}
      {/* Action buttons                                                      */}
      {/* ------------------------------------------------------------------ */}
      <View style={styles.actionsContainer}>
        {/* Pass */}
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={`Neka ${profile.displayName}`}
          onPress={handlePass}
          style={styles.passButton}
        >
          <X size={28} weight="bold" color={COLORS.charcoal} />
        </AnimatedPressable>

        {/* Like */}
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={`Gilla ${profile.displayName}`}
          onPress={handleLike}
          style={styles.likeButton}
        >
          <Heart size={32} weight="fill" color="#FFFFFF" />
        </AnimatedPressable>

        {/* View profile text link */}
        <Pressable
          onPress={onViewProfile}
          accessibilityRole="button"
          accessibilityLabel={`Visa profil för ${profile.displayName}`}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          style={styles.viewProfileButton}
        >
          <Text style={styles.viewProfileText}>Visa profil</Text>
        </Pressable>
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.charcoal,
    overflow: 'hidden',
  },

  // Gradient
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },

  // Badge
  badgeContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    zIndex: 10,
  },

  // Info overlay
  infoContainer: {
    position: 'absolute',
    bottom: 160,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  nameText: {
    fontSize: 32,
    fontFamily: 'GeneralSans-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(253,248,243,0.85)',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  blurbText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(245,237,228,0.90)',
    marginTop: SPACING.sm,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Actions
  actionsContainer: {
    position: 'absolute',
    bottom: SPACING.xl + SPACING.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    zIndex: 10,
  },
  passButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(253,248,243,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.copper,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.copper,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  viewProfileButton: {
    paddingVertical: SPACING.xs,
  },
  viewProfileText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: 'rgba(253,248,243,0.90)',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(253,248,243,0.5)',
  },
})
