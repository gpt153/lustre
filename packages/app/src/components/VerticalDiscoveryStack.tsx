import React, { useCallback, useMemo } from 'react'
import { View, Dimensions, StyleSheet, type ImageSourcePropType } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { PolaroidCard } from '@lustre/ui'
import { getPolaroidDimensions } from '@lustre/tokens'
import { OverlayActionButtons } from './OverlayActionButtons'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiscoveryProfile {
  id: string
  displayName: string
  age?: number
  tagline?: string
  photos: Array<{ url?: string; thumbnailLarge?: string }>
}

export interface VerticalDiscoveryStackProps {
  profiles: DiscoveryProfile[]
  currentIndex: number
  onLike: (profileId: string) => void
  onPass: (profileId: string) => void
  onSuperLike: (profileId: string) => void
  onProfilePress?: (profileId: string) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 380) // max-w-sm ≈ 384

const SWIPE_THRESHOLD = 120 // px distance to trigger advance/go-back
const VELOCITY_THRESHOLD = 600 // px/s

// Spring configs from animations.ts
const SPRING_DEFAULT = { damping: 20, stiffness: 90, mass: 1 }
const SPRING_SNAPPY = { damping: 25, stiffness: 200, mass: 0.8 }

// Ken Burns
const KEN_BURNS_SCALE = 1.05
const KEN_BURNS_DURATION = 6000

// Colors from Stitch
const PRIMARY = '#894d0d'
const SURFACE_CONTAINER_HIGH = '#f4e5e0'

// Transparent 1x1 PNG fallback
const PHOTO_PLACEHOLDER: ImageSourcePropType = {
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPhotoUrl(profile?: DiscoveryProfile): string | undefined {
  if (!profile?.photos?.[0]) return undefined
  return profile.photos[0].thumbnailLarge || profile.photos[0].url
}

function buildCaption(profile: DiscoveryProfile): string {
  const parts = [profile.displayName]
  if (profile.age) parts.push(`${profile.age}`)
  return parts.join(', ')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VerticalDiscoveryStack({
  profiles,
  currentIndex,
  onLike,
  onPass,
  onSuperLike,
  onProfilePress,
}: VerticalDiscoveryStackProps) {
  const cardDims = useMemo(() => getPolaroidDimensions(CARD_WIDTH), [])

  const prevProfile = profiles[currentIndex - 1]
  const currentProfile = profiles[currentIndex]
  const nextProfile = profiles[currentIndex + 1]

  // -- Shared values --
  const translateY = useSharedValue(0)
  const isAnimating = useSharedValue(false)

  // Ken Burns slow zoom on main card
  const kenBurnsScale = useSharedValue(1)

  // Start Ken Burns effect when current card is visible
  React.useEffect(() => {
    kenBurnsScale.value = 1
    kenBurnsScale.value = withTiming(KEN_BURNS_SCALE, { duration: KEN_BURNS_DURATION })
  }, [currentIndex, kenBurnsScale])

  // -- Callbacks bridged to JS thread --
  const triggerAdvance = useCallback(() => {
    if (!currentProfile) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onLike(currentProfile.id)
  }, [currentProfile, onLike])

  const triggerGoBack = useCallback(() => {
    if (!prevProfile) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPass(prevProfile.id)
  }, [prevProfile, onPass])

  // -- Pan gesture (vertical swipe) --
  const panGesture = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .failOffsetX([-30, 30])
    .onUpdate((event) => {
      if (isAnimating.value) return
      translateY.value = event.translationY
    })
    .onEnd((event) => {
      if (isAnimating.value) return

      const swipedUp =
        event.translationY < -SWIPE_THRESHOLD ||
        event.velocityY < -VELOCITY_THRESHOLD
      const swipedDown =
        event.translationY > SWIPE_THRESHOLD ||
        event.velocityY > VELOCITY_THRESHOLD

      if (swipedUp && currentProfile) {
        // Advance to next card
        isAnimating.value = true
        translateY.value = withSpring(
          -SCREEN_HEIGHT * 0.6,
          SPRING_DEFAULT,
          () => {
            isAnimating.value = false
            translateY.value = 0
            runOnJS(triggerAdvance)()
          },
        )
      } else if (swipedDown && prevProfile) {
        // Go back to previous card
        isAnimating.value = true
        translateY.value = withSpring(
          SCREEN_HEIGHT * 0.6,
          SPRING_DEFAULT,
          () => {
            isAnimating.value = false
            translateY.value = 0
            runOnJS(triggerGoBack)()
          },
        )
      } else {
        // Snap back
        translateY.value = withSpring(0, SPRING_SNAPPY)
      }
    })

  // -- Animated styles --

  // Previous card (peeking above)
  const prevCardStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [-200, 0, 200],
      [0, 0, 1],
      Extrapolation.CLAMP,
    )
    return {
      opacity: 0.4 + progress * 0.3,
      transform: [
        { translateY: interpolate(progress, [0, 1], [4, 20]) },
        { rotate: '2deg' },
        { scale: interpolate(progress, [0, 1], [0.92, 0.98]) },
      ],
    }
  })

  // Main (current) card
  const mainCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: '-1deg' },
    ],
  }))

  // Ken Burns on the image overlay
  const kenBurnsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: kenBurnsScale.value }],
  }))

  // Next card (peeking below)
  const nextCardStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [-200, 0, 200],
      [1, 0, 0],
      Extrapolation.CLAMP,
    )
    return {
      opacity: 0.6 + progress * 0.2,
      transform: [
        { translateY: interpolate(progress, [0, 1], [-4, -20]) },
        { rotate: '-3deg' },
        { scale: interpolate(progress, [0, 1], [0.92, 0.98]) },
      ],
    }
  })

  // -- Action button handlers --
  const handlePass = useCallback(() => {
    if (!currentProfile) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPass(currentProfile.id)
  }, [currentProfile, onPass])

  const handleSuperLike = useCallback(() => {
    if (!currentProfile) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    onSuperLike(currentProfile.id)
  }, [currentProfile, onSuperLike])

  const handleLike = useCallback(() => {
    if (!currentProfile) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onLike(currentProfile.id)
  }, [currentProfile, onLike])

  const handleProfilePress = useCallback(() => {
    if (!currentProfile || !onProfilePress) return
    onProfilePress(currentProfile.id)
  }, [currentProfile, onProfilePress])

  if (!currentProfile) return null

  const currentPhotoUrl = getPhotoUrl(currentProfile)
  const prevPhotoUrl = getPhotoUrl(prevProfile)
  const nextPhotoUrl = getPhotoUrl(nextProfile)

  return (
    <View
      style={styles.container}
      accessibilityLabel="Vertikal profilstapel"
      accessibilityRole="adjustable"
    >
      {/* ---- Previous card (peeking above) ---- */}
      {prevProfile && (
        <Animated.View
          style={[
            styles.peekCard,
            styles.prevCard,
            { width: CARD_WIDTH },
            prevCardStyle,
          ]}
          pointerEvents="none"
        >
          <PolaroidCard
            cardWidth={CARD_WIDTH}
            imageSource={
              prevPhotoUrl ? { uri: prevPhotoUrl } : PHOTO_PLACEHOLDER
            }
            imageAlt={`${prevProfile.displayName} profil`}
            accessibilityLabel={`Föregående: ${prevProfile.displayName}`}
          >
            {/* Grey placeholder overlay for prev card */}
            <View style={styles.placeholderOverlay} />
          </PolaroidCard>
        </Animated.View>
      )}

      {/* ---- Main card ---- */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.mainCard,
            { width: CARD_WIDTH },
            mainCardStyle,
          ]}
        >
          <PolaroidCard
            cardWidth={CARD_WIDTH}
            imageSource={
              currentPhotoUrl ? { uri: currentPhotoUrl } : PHOTO_PLACEHOLDER
            }
            imageAlt={`${currentProfile.displayName} profilbild`}
            caption={buildCaption(currentProfile)}
            rotation={0} // rotation handled by animated style
            onPress={handleProfilePress}
            accessibilityLabel={`Profil: ${buildCaption(currentProfile)}${currentProfile.tagline ? `, ${currentProfile.tagline}` : ''}`}
          >
            {/* Ken Burns zoom layer */}
            <Animated.View style={[styles.kenBurnsLayer, kenBurnsStyle]} />

            {/* Gradient overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.10)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
              style={styles.gradientOverlay}
              pointerEvents="none"
            />

            {/* Tagline text (below caption in the image area) */}
            {currentProfile.tagline && (
              <View style={styles.taglineContainer} pointerEvents="none">
                <Animated.Text
                  style={styles.taglineText}
                  numberOfLines={1}
                >
                  {currentProfile.tagline}
                </Animated.Text>
              </View>
            )}

            {/* Overlay action buttons */}
            <OverlayActionButtons
              onPass={handlePass}
              onSuperLike={handleSuperLike}
              onLike={handleLike}
            />
          </PolaroidCard>
        </Animated.View>
      </GestureDetector>

      {/* ---- Next card (peeking below) ---- */}
      {nextProfile && (
        <Animated.View
          style={[
            styles.peekCard,
            styles.nextCard,
            { width: CARD_WIDTH },
            nextCardStyle,
          ]}
          pointerEvents="none"
        >
          <PolaroidCard
            cardWidth={CARD_WIDTH}
            imageSource={
              nextPhotoUrl ? { uri: nextPhotoUrl } : PHOTO_PLACEHOLDER
            }
            imageAlt={`${nextProfile.displayName} profil`}
            accessibilityLabel={`Nästa: ${nextProfile.displayName}`}
          />
        </Animated.View>
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Previous card — peeking above
  peekCard: {
    position: 'absolute',
    alignSelf: 'center',
  },
  prevCard: {
    top: -128, // -top-32 (32 * 4 = 128)
    zIndex: 1,
  },

  // Main card
  mainCard: {
    zIndex: 20,
    alignSelf: 'center',
  },

  // Next card — peeking below
  nextCard: {
    bottom: -192, // -bottom-48 (48 * 4 = 192)
    zIndex: 1,
  },

  // Grey placeholder overlay for prev card content
  placeholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SURFACE_CONTAINER_HIGH,
    borderRadius: 2,
  },

  // Ken Burns — invisible stretch layer (the actual scale effect is visual via image sizing)
  kenBurnsLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  // Gradient overlay on photo
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Tagline positioned at bottom of image area
  taglineContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 48, // leave room for action buttons
  },
  taglineText: {
    fontFamily: 'Caveat_400Regular',
    fontSize: 14,
    color: `rgba(255, 255, 255, 0.80)`,
    textShadowColor: 'rgba(0, 0, 0, 0.30)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
})
