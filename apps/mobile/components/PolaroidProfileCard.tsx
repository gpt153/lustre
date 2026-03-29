/**
 * PolaroidProfileCard
 *
 * A Polaroid-framed profile card for the discovery screen.
 *
 * Layout:
 *   - White Polaroid frame built directly from getPolaroidDimensions tokens
 *   - Story segments (photos + prompts) inside the image area
 *   - StoryProgressBar pinned to the top of the image area
 *   - Name/age overlay inside the image area (bottom-left, above gradient)
 *   - Action buttons on the white bottom caption strip (right-aligned)
 *   - Ken Burns zoom constrained to the image area
 *
 * Gesture composition (preserved exactly from ProfileCardStory):
 *   Gesture.Race(
 *     Gesture.Exclusive(panGesture, tapGesture),
 *     longPressGesture,
 *   )
 *   - Pan activates after 20 px horizontal movement → like / pass
 *   - Tap left 30% → prev segment, right 70% → next segment
 *   - LongPress (300 ms) pauses Ken Burns
 *
 * Accessibility:
 *   When screenReaderEnabled renders AccessibleFallback (ScrollView with all
 *   segments visible and Like/Pass as accessible buttons).
 */

import React, { useCallback, useMemo } from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import { Heart, X, Lightning } from 'phosphor-react-native'
import {
  getPolaroidDimensions,
  POLAROID_SHADOW,
} from '@lustre/tokens'
import { COLORS, SPACING } from '@/constants/tokens'
import { SPRING, TIMING } from '@/constants/animations'
import { AnimatedPressable } from '@/components/AnimatedPressable'
import { SparkBadge } from '@/components/SparkBadge'
import { StoryProgressBar } from '@/components/StoryProgressBar'
import { useKenBurns } from '@/hooks/useKenBurns'
import { useStoryNavigation } from '@/hooks/useStoryNavigation'
import { useAccessibility } from '@/hooks/useAccessibility'
import { PROMPT_OPTIONS } from '@lustre/api'
import * as Haptics from 'expo-haptics'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Swipe thresholds
const SWIPE_DISTANCE_THRESHOLD = 80
const SWIPE_VELOCITY_THRESHOLD = 800

// Prompt background cycle — subtle warm variations
const PROMPT_BACKGROUNDS = [
  COLORS.warmWhite,
  'rgba(184,115,51,0.04)',
  'rgba(212,168,67,0.04)',
] as const

// ---------------------------------------------------------------------------
// Re-exported types (shared with ProfileCardStory)
// ---------------------------------------------------------------------------

export interface ProfilePhoto {
  url: string
  thumbnailLarge?: string
  thumbnailMedium?: string
}

export interface ProfilePrompt {
  promptKey: string
  response: string
  order: number
}

export interface ProfileCardStoryProfile {
  userId: string
  displayName: string
  age: number
  location?: string
  photos: ProfilePhoto[]
  prompts: ProfilePrompt[]
  sparkedYou?: boolean
}

export interface PolaroidProfileCardProps {
  profile: ProfileCardStoryProfile
  cardWidth: number
  onLike: () => void
  onPass: () => void
  onSpark: () => void
  sparkBalance?: number
  sparkDisabled?: boolean
  swipeX?: SharedValue<number>
  style?: ViewStyle
}

// ---------------------------------------------------------------------------
// Segment types
// ---------------------------------------------------------------------------

type PhotoSegment = { type: 'photo'; photo: ProfilePhoto; key: string }
type PromptSegment = {
  type: 'prompt'
  promptKey: string
  response: string
  bgIndex: number
  key: string
}
type Segment = PhotoSegment | PromptSegment

function buildSegments(profile: ProfileCardStoryProfile): Segment[] {
  const segments: Segment[] = []
  const sortedPrompts = [...profile.prompts].sort((a, b) => a.order - b.order)
  let bgIndex = 0

  if (profile.photos.length > 0) {
    segments.push({ type: 'photo', photo: profile.photos[0], key: 'photo-0' })
  }

  sortedPrompts.forEach((prompt, pIdx) => {
    segments.push({
      type: 'prompt',
      promptKey: prompt.promptKey,
      response: prompt.response,
      bgIndex: bgIndex % PROMPT_BACKGROUNDS.length,
      key: `prompt-${pIdx}`,
    })
    bgIndex++
    const nextPhoto = profile.photos[pIdx + 1]
    if (nextPhoto) {
      segments.push({
        type: 'photo',
        photo: nextPhoto,
        key: `photo-${pIdx + 1}`,
      })
    }
  })

  for (let i = sortedPrompts.length + 1; i < profile.photos.length; i++) {
    segments.push({ type: 'photo', photo: profile.photos[i], key: `photo-${i}` })
  }

  return segments
}

// ---------------------------------------------------------------------------
// Photo segment inner component
// ---------------------------------------------------------------------------

interface PhotoSegmentViewProps {
  photo: ProfilePhoto
  isActive: boolean
  parallaxStyle: ReturnType<typeof useAnimatedStyle>
  longPressActive: SharedValue<boolean>
}

function PhotoSegmentView({
  photo,
  isActive,
  parallaxStyle,
  longPressActive,
}: PhotoSegmentViewProps) {
  const { kenBurnsStyle, pauseKenBurns, resumeKenBurns } = useKenBurns(isActive)

  useAnimatedReaction(
    () => longPressActive.value,
    (isPressed, wasPressed) => {
      if (isActive) {
        if (isPressed && !wasPressed) {
          pauseKenBurns()
        } else if (!isPressed && wasPressed) {
          resumeKenBurns()
        }
      }
    },
    [isActive],
  )

  const uri = photo.thumbnailLarge ?? photo.url

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, kenBurnsStyle, parallaxStyle]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>
      <LinearGradient
        colors={['transparent', 'rgba(44,36,33,0.65)']}
        style={styles.photoGradient}
        pointerEvents="none"
      />
    </View>
  )
}

// ---------------------------------------------------------------------------
// Prompt segment inner component
// ---------------------------------------------------------------------------

interface PromptSegmentViewProps {
  promptKey: string
  response: string
  bgIndex: number
}

function PromptSegmentView({ promptKey, response, bgIndex }: PromptSegmentViewProps) {
  const bg = PROMPT_BACKGROUNDS[bgIndex] ?? COLORS.warmWhite
  const question = PROMPT_OPTIONS[promptKey] ?? promptKey

  return (
    <View style={[styles.promptContainer, { backgroundColor: bg }]}>
      <Text style={styles.promptQuestion}>{question}</Text>
      <Text style={styles.promptAnswer}>{response}</Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Accessible fallback (VoiceOver / TalkBack)
// ---------------------------------------------------------------------------

interface AccessibleFallbackProps {
  profile: ProfileCardStoryProfile
  segments: Segment[]
  onLike: () => void
  onPass: () => void
  onSpark: () => void
  sparkDisabled?: boolean
}

function AccessibleFallback({
  profile,
  segments,
  onLike,
  onPass,
  onSpark,
  sparkDisabled,
}: AccessibleFallbackProps) {
  return (
    <ScrollView
      style={styles.a11yScroll}
      accessible
      accessibilityLabel={`Profil: ${profile.displayName}, ${profile.age} år`}
    >
      {segments.map((seg) => {
        if (seg.type === 'photo') {
          const uri = seg.photo.thumbnailLarge ?? seg.photo.url
          return (
            <Image
              key={seg.key}
              source={{ uri }}
              style={styles.a11yPhoto}
              resizeMode="cover"
              accessibilityLabel={`Foto av ${profile.displayName}`}
            />
          )
        }
        const question = PROMPT_OPTIONS[seg.promptKey] ?? seg.promptKey
        return (
          <View key={seg.key} style={styles.a11yPrompt}>
            <Text style={styles.a11yPromptQuestion}>{question}</Text>
            <Text style={styles.a11yPromptAnswer}>{seg.response}</Text>
          </View>
        )
      })}
      <View style={styles.a11yActions}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={`Gilla ${profile.displayName}`}
          onPress={onLike}
          style={styles.a11yActionBtn}
        >
          <Heart size={28} weight="fill" color={COLORS.copper} />
          <Text style={styles.a11yActionLabel}>Gilla</Text>
        </AnimatedPressable>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Spark"
          onPress={onSpark}
          style={[styles.a11yActionBtn, sparkDisabled && styles.actionBtnDisabled]}
          disabled={sparkDisabled}
        >
          <Lightning size={28} weight="fill" color={sparkDisabled ? '#999' : COLORS.gold} />
          <Text style={styles.a11yActionLabel}>Spark</Text>
        </AnimatedPressable>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={`Neka ${profile.displayName}`}
          onPress={onPass}
          style={styles.a11yActionBtn}
        >
          <X size={28} weight="bold" color={COLORS.charcoal} />
          <Text style={styles.a11yActionLabel}>Neka</Text>
        </AnimatedPressable>
      </View>
    </ScrollView>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PolaroidProfileCard({
  profile,
  cardWidth,
  onLike,
  onPass,
  onSpark,
  sparkBalance,
  sparkDisabled,
  swipeX: externalSwipeX,
  style,
}: PolaroidProfileCardProps) {
  const { screenReaderEnabled } = useAccessibility()

  const segments = useMemo(() => buildSegments(profile), [profile])

  const { currentIndex, next, prev } = useStoryNavigation({
    segmentCount: segments.length,
  })

  // Compute Polaroid layout dimensions
  const dim = useMemo(() => getPolaroidDimensions(cardWidth), [cardWidth])

  // Swipe animation shared values
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const cardRotation = useSharedValue(0)
  const internalSwipeX = useSharedValue(0)
  const swipeX = externalSwipeX ?? internalSwipeX

  // Segment crossfade
  const segmentOpacity = useSharedValue(1)
  const segmentScale = useSharedValue(1)

  // Long-press state (signals PhotoSegmentView on UI thread)
  const longPressActive = useSharedValue(false)

  const triggerHapticLight = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const triggerHapticMedium = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [])

  const nextSegment = useCallback(() => {
    triggerHapticLight()
    segmentOpacity.value = withTiming(0, { duration: TIMING.fast / 2 }, () => {
      runOnJS(next)()
      segmentOpacity.value = withTiming(1, { duration: TIMING.fast / 2 })
    })
    segmentScale.value = withTiming(0.98, { duration: TIMING.fast / 2 }, () => {
      segmentScale.value = withTiming(1, { duration: TIMING.fast / 2 })
    })
  }, [next, segmentOpacity, segmentScale, triggerHapticLight])

  const prevSegment = useCallback(() => {
    triggerHapticLight()
    segmentOpacity.value = withTiming(0, { duration: TIMING.fast / 2 }, () => {
      runOnJS(prev)()
      segmentOpacity.value = withTiming(1, { duration: TIMING.fast / 2 })
    })
    segmentScale.value = withTiming(0.98, { duration: TIMING.fast / 2 }, () => {
      segmentScale.value = withTiming(1, { duration: TIMING.fast / 2 })
    })
  }, [prev, segmentOpacity, segmentScale, triggerHapticLight])

  const handleSwipeLeft = useCallback(() => {
    triggerHapticMedium()
    onPass()
  }, [onPass, triggerHapticMedium])

  const handleSwipeRight = useCallback(() => {
    triggerHapticMedium()
    onLike()
  }, [onLike, triggerHapticMedium])

  // -------------------------------------------------------------------------
  // Gesture definitions
  // -------------------------------------------------------------------------

  const tapGesture = Gesture.Tap()
    .maxDistance(5)
    .onEnd((e) => {
      'worklet'
      // Tap zone is relative to the whole screen (absoluteX), matching ProfileCardStory
      const isRightSide = e.absoluteX > SCREEN_WIDTH * 0.3
      if (isRightSide) {
        runOnJS(nextSegment)()
      } else {
        runOnJS(prevSegment)()
      }
    })

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      'worklet'
      translateX.value = e.translationX
      translateY.value = e.translationY * 0.3
      cardRotation.value = interpolate(
        e.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-12, 0, 12],
      )
      swipeX.value = e.translationX
    })
    .onEnd((e) => {
      'worklet'
      const swipedRight =
        e.translationX > SWIPE_DISTANCE_THRESHOLD ||
        e.velocityX > SWIPE_VELOCITY_THRESHOLD
      const swipedLeft =
        e.translationX < -SWIPE_DISTANCE_THRESHOLD ||
        e.velocityX < -SWIPE_VELOCITY_THRESHOLD

      if (swipedRight) {
        translateX.value = withTiming(
          SCREEN_WIDTH * 1.5,
          { duration: TIMING.fast },
          () => {
            runOnJS(handleSwipeRight)()
          },
        )
      } else if (swipedLeft) {
        translateX.value = withTiming(
          -SCREEN_WIDTH * 1.5,
          { duration: TIMING.fast },
          () => {
            runOnJS(handleSwipeLeft)()
          },
        )
      } else {
        translateX.value = withSpring(0, SPRING.default)
        translateY.value = withSpring(0, SPRING.default)
        cardRotation.value = withSpring(0, SPRING.default)
        swipeX.value = withSpring(0, SPRING.default)
      }
    })

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      'worklet'
      longPressActive.value = true
    })
    .onEnd(() => {
      'worklet'
      longPressActive.value = false
    })
    .onFinalize(() => {
      'worklet'
      longPressActive.value = false
    })

  const composedGesture = Gesture.Race(
    Gesture.Exclusive(panGesture, tapGesture),
    longPressGesture,
  )

  // -------------------------------------------------------------------------
  // Animated styles
  // -------------------------------------------------------------------------

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${cardRotation.value}deg` },
    ],
  }))

  const segmentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: segmentOpacity.value,
    transform: [{ scale: segmentScale.value }],
  }))

  // Parallax: photo shifts subtly opposite to swipe direction
  const parallaxStyle = useAnimatedStyle(() => {
    const photoTranslateX = interpolate(
      swipeX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [SCREEN_WIDTH * 0.1, 0, -SCREEN_WIDTH * 0.1],
    )
    return { transform: [{ translateX: photoTranslateX }] }
  })

  // -------------------------------------------------------------------------
  // Accessibility fallback
  // -------------------------------------------------------------------------

  if (screenReaderEnabled) {
    return (
      <AccessibleFallback
        profile={profile}
        segments={segments}
        onLike={onLike}
        onPass={onPass}
        onSpark={onSpark}
        sparkDisabled={sparkDisabled}
      />
    )
  }

  // -------------------------------------------------------------------------
  // Derived layout values
  // -------------------------------------------------------------------------

  const { cardHeight, imageWidth, imageHeight, borderSide, borderTop } = dim

  // Caption strip height = total card height minus top border minus image height
  const captionHeight = cardHeight - borderTop - imageHeight

  // Caveat is loaded globally by loadLustreFonts() in app/_layout.tsx before
  // the app renders, so we can reference the registered font name directly.
  const captionFontFamily = 'Caveat_400Regular'

  const currentSegment = segments[currentIndex]

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Animated.View
      style={[
        {
          width: cardWidth,
          height: cardHeight,
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          ...POLAROID_SHADOW,
          overflow: 'hidden',
        },
        cardAnimatedStyle,
        style,
      ]}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Image area — positioned using Polaroid tokens                       */}
      {/* ------------------------------------------------------------------ */}
      <View
        style={{
          position: 'absolute',
          top: borderTop,
          left: borderSide,
          width: imageWidth,
          height: imageHeight,
          overflow: 'hidden',
        }}
      >
        <GestureDetector gesture={composedGesture}>
          <View style={StyleSheet.absoluteFill}>
            {/* Segment content */}
            <Animated.View style={[StyleSheet.absoluteFill, segmentAnimatedStyle]}>
              {currentSegment?.type === 'photo' && (
                <PhotoSegmentView
                  photo={currentSegment.photo}
                  isActive
                  parallaxStyle={parallaxStyle}
                  longPressActive={longPressActive}
                />
              )}
              {currentSegment?.type === 'prompt' && (
                <PromptSegmentView
                  promptKey={currentSegment.promptKey}
                  response={currentSegment.response}
                  bgIndex={currentSegment.bgIndex}
                />
              )}
            </Animated.View>

            {/* Progress bar — pinned to top of image area */}
            <View style={styles.progressBarContainer}>
              <StoryProgressBar
                segmentCount={segments.length}
                currentIndex={currentIndex}
              />
            </View>

            {/* Name / age / location overlay — bottom-left of image area */}
            <View style={styles.nameOverlay} pointerEvents="none">
              <Text style={styles.nameText}>
                {profile.displayName}, {profile.age}
              </Text>
              {profile.location ? (
                <Text style={styles.locationText}>{profile.location}</Text>
              ) : null}
              {profile.sparkedYou ? (
                <SparkBadge style={{ marginTop: 4 }} />
              ) : null}
            </View>
          </View>
        </GestureDetector>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Caption strip — white bottom area below the image                  */}
      {/* ------------------------------------------------------------------ */}
      <View
        style={{
          position: 'absolute',
          top: borderTop + imageHeight,
          left: 0,
          right: 0,
          height: captionHeight,
          paddingHorizontal: borderSide,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: name + age in Caveat */}
        <View style={styles.captionLeft}>
          <Text
            style={[styles.captionName, { fontFamily: captionFontFamily }]}
            numberOfLines={1}
          >
            {profile.displayName}, {profile.age}
          </Text>
          {profile.location ? (
            <Text
              style={[styles.captionLocation, { fontFamily: captionFontFamily }]}
              numberOfLines={1}
            >
              {profile.location}
            </Text>
          ) : null}
        </View>

        {/* Right: action buttons — compact row */}
        <View style={styles.captionActions}>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={`Neka ${profile.displayName}`}
            onPress={onPass}
            style={styles.actionBtn}
          >
            <X size={20} weight="bold" color={COLORS.charcoal} />
          </AnimatedPressable>

          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Spark"
            onPress={onSpark}
            style={[styles.actionBtn, sparkDisabled && styles.actionBtnDisabled]}
            disabled={sparkDisabled}
          >
            <Lightning size={20} weight="fill" color={sparkDisabled ? '#999' : COLORS.gold} />
          </AnimatedPressable>

          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={`Gilla ${profile.displayName}`}
            onPress={onLike}
            style={styles.actionBtn}
          >
            <Heart size={20} weight="fill" color={COLORS.copper} />
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Progress bar — inside image area, absolute top
  progressBarContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 10,
  },

  // Photo gradient overlay
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },

  // Name overlay inside image area
  nameOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  nameText: {
    fontSize: 18,
    fontFamily: 'GeneralSans-Bold',
    color: '#FDF8F3',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(253,248,243,0.85)',
    marginTop: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Caption strip — left side
  captionLeft: {
    flex: 1,
    marginRight: 8,
  },
  captionName: {
    fontSize: 18,
    color: COLORS.charcoal,
    lineHeight: 22,
  },
  captionLocation: {
    fontSize: 13,
    color: COLORS.warmGray,
    lineHeight: 17,
    marginTop: 1,
  },

  // Caption strip — right side action buttons
  captionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },

  // Prompt segment
  promptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  promptQuestion: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.charcoal,
    opacity: 0.6,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  promptAnswer: {
    fontSize: 18,
    fontFamily: 'GeneralSans-SemiBold',
    color: COLORS.charcoal,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Accessibility fallback
  a11yScroll: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
  },
  a11yPhoto: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  a11yPrompt: {
    padding: SPACING.md,
    backgroundColor: COLORS.warmCream,
    marginVertical: 4,
  },
  a11yPromptQuestion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.warmGray,
    marginBottom: 4,
  },
  a11yPromptAnswer: {
    fontSize: 18,
    fontFamily: 'GeneralSans-SemiBold',
    color: COLORS.charcoal,
  },
  a11yActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
  },
  a11yActionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  a11yActionLabel: {
    fontSize: 12,
    color: COLORS.charcoal,
    fontFamily: 'Inter-Regular',
  },
})
