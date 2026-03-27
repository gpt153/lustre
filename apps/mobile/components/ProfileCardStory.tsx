/**
 * ProfileCardStory
 *
 * Story-format profile card for the Lustre discover screen.
 *
 * Layout:
 *   - Full-bleed photo or prompt segment filling the card
 *   - Segmented progress bar pinned to the top
 *   - Name / age / location overlay at the bottom-left
 *   - Like / Pass / SuperLike action buttons in a blurred pill at the bottom
 *
 * Gesture composition:
 *   Gesture.Race(
 *     Gesture.Exclusive(panGesture, tapGesture),  // swipe OR tap
 *     longPressGesture,                           // pause Ken Burns
 *   )
 *   - Pan activates after 20 px horizontal movement and drives like/pass
 *   - Tap on left 30% → prev segment, right 70% → next segment
 *   - LongPress (300 ms) pauses Ken Burns and shows full photo
 *
 * Accessibility:
 *   When screenReaderEnabled the card renders as a vertical ScrollView
 *   with all segments visible and Like/Pass as accessibility actions.
 */

import React, { useCallback, useMemo } from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  interpolate,
  runOnJS,
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
import { Heart, X, Star } from 'phosphor-react-native'
import * as Haptics from 'expo-haptics'
import { COLORS, SPACING } from '@/constants/tokens'
import { SPRING, TIMING } from '@/constants/animations'
import { AnimatedPressable } from './AnimatedPressable'
import { StoryProgressBar } from './StoryProgressBar'
import { useKenBurns } from '@/hooks/useKenBurns'
import { useStoryNavigation } from '@/hooks/useStoryNavigation'
import { useAccessibility } from '@/hooks/useAccessibility'
import { PROMPT_OPTIONS } from '@lustre/api'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const CARD_WIDTH = SCREEN_WIDTH
const CARD_HEIGHT = SCREEN_HEIGHT

// Swipe thresholds for like / pass
const SWIPE_DISTANCE_THRESHOLD = 80
const SWIPE_VELOCITY_THRESHOLD = 800

// Prompt background cycle – subtle warm variations without Skia
const PROMPT_BACKGROUNDS = [
  COLORS.warmWhite,
  'rgba(184,115,51,0.04)',
  'rgba(212,168,67,0.04)',
] as const

// ---------------------------------------------------------------------------
// Types
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
}

export interface ProfileCardStoryProps {
  profile: ProfileCardStoryProfile
  onLike: () => void
  onPass: () => void
  onSuperLike: () => void
  /** Reanimated shared value driven by parent swipe gesture (for parallax). */
  swipeX?: ReturnType<typeof useSharedValue<number>>
  style?: object
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

  // First photo always first
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

  // Remaining photos after all prompts
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
  /** Shared value set to true by the parent's LongPress gesture. */
  longPressActive: ReturnType<typeof useSharedValue<boolean>>
}

function PhotoSegmentView({
  photo,
  isActive,
  parallaxStyle,
  longPressActive,
}: PhotoSegmentViewProps) {
  const { kenBurnsStyle, pauseKenBurns, resumeKenBurns } = useKenBurns(isActive)

  // React to long-press changes on the UI thread so Ken Burns responds instantly.
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
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, kenBurnsStyle, parallaxStyle]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>
      <LinearGradient
        colors={['transparent', 'rgba(44,36,33,0.6)']}
        style={styles.gradient}
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
  onSuperLike: () => void
}

function AccessibleFallback({
  profile,
  segments,
  onLike,
  onPass,
  onSuperLike,
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
          accessibilityLabel="SuperLike"
          onPress={onSuperLike}
          style={styles.a11yActionBtn}
        >
          <Star size={28} weight="fill" color={COLORS.gold} />
          <Text style={styles.a11yActionLabel}>SuperLike</Text>
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

export function ProfileCardStory({
  profile,
  onLike,
  onPass,
  onSuperLike,
  swipeX: externalSwipeX,
  style,
}: ProfileCardStoryProps) {
  const { screenReaderEnabled } = useAccessibility()

  const segments = useMemo(() => buildSegments(profile), [profile])

  const { currentIndex, next, prev } = useStoryNavigation({
    segmentCount: segments.length,
  })

  // Internal swipe translate values
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const cardRotation = useSharedValue(0)
  // Always create an internal shared value; use external one if provided.
  const internalSwipeX = useSharedValue(0)
  const swipeX = externalSwipeX ?? internalSwipeX

  // Segment crossfade
  const segmentOpacity = useSharedValue(1)
  const segmentScale = useSharedValue(1)

  const triggerHapticLight = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const triggerHapticMedium = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [])

  const nextSegment = useCallback(() => {
    triggerHapticLight()
    // Brief scale + opacity crossfade on JS side
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

  const longPressActive = useSharedValue(false)

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      'worklet'
      // Ken Burns pause is handled in PhotoSegmentView — we just signal via
      // a shared value so the photo segment can react on the UI thread.
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

  // Parallax for photo: photo shifts subtly opposite to swipe direction
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
        onSuperLike={onSuperLike}
      />
    )
  }

  // -------------------------------------------------------------------------
  // Current segment
  // -------------------------------------------------------------------------

  const currentSegment = segments[currentIndex]

  return (
    <Animated.View style={[styles.card, cardAnimatedStyle, style]}>
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

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <StoryProgressBar
              segmentCount={segments.length}
              currentIndex={currentIndex}
            />
          </View>

          {/* Name / age / location overlay */}
          <View style={styles.nameOverlay} pointerEvents="none">
            <Text style={styles.nameText}>
              {profile.displayName}, {profile.age}
            </Text>
            {profile.location ? (
              <Text style={styles.locationText}>{profile.location}</Text>
            ) : null}
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer} pointerEvents="box-none">
            <View style={styles.actionsPill}>
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel={`Neka ${profile.displayName}`}
                onPress={onPass}
                style={styles.actionBtn}
              >
                <X size={28} weight="bold" color={COLORS.charcoal} />
              </AnimatedPressable>

              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel="SuperLike"
                onPress={onSuperLike}
                style={styles.actionBtn}
              >
                <Star size={24} weight="fill" color={COLORS.gold} />
              </AnimatedPressable>

              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel={`Gilla ${profile.displayName}`}
                onPress={onLike}
                style={styles.actionBtn}
              >
                <Heart size={28} weight="fill" color={COLORS.copper} />
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </GestureDetector>
    </Animated.View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    backgroundColor: COLORS.charcoal,
  },

  // Progress bar
  progressBarContainer: {
    position: 'absolute',
    top: 52,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },

  // Gradient overlay (inside PhotoSegmentView)
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },

  // Name / location overlay
  nameOverlay: {
    position: 'absolute',
    bottom: 120,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  nameText: {
    fontSize: 24,
    fontFamily: 'GeneralSans-Bold',
    color: '#FDF8F3',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(253,248,243,0.85)',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Action buttons
  actionsContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  actionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    backgroundColor: 'rgba(253,248,243,0.18)',
    borderRadius: 40,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(253,248,243,0.15)',
  },

  // Prompt segment
  promptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  promptQuestion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.charcoal,
    opacity: 0.6,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  promptAnswer: {
    fontSize: 22,
    fontFamily: 'GeneralSans-SemiBold',
    color: COLORS.charcoal,
    textAlign: 'center',
    lineHeight: 30,
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
    marginVertical: SPACING.xs,
  },
  a11yPromptQuestion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.warmGray,
    marginBottom: SPACING.xs,
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
    gap: SPACING.xs,
  },
  a11yActionLabel: {
    fontSize: 12,
    color: COLORS.charcoal,
    fontFamily: 'Inter-Regular',
  },
})
