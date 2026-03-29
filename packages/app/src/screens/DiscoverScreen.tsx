import { useState, useCallback } from 'react'
import { StyleSheet, Dimensions, Pressable, View, type ImageSourcePropType } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { YStack, Text, Spinner } from 'tamagui'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { PolaroidCard } from '@lustre/ui'
import { getPolaroidDimensions } from '@lustre/tokens'
import { useDiscovery } from '../hooks/useDiscovery'
import { useSwipeGesture } from '../hooks/useSwipeGesture'
import { SwipeStamp } from '../components/SwipeStamp'
import { MatchAnimation } from '../components/MatchAnimation'
import { EmptyState } from '../components/EmptyState'
import { DiscoveryActionButtons } from '../components/DiscoveryActionButtons'

// Transparent 1x1 PNG as a safe fallback when no profile photo is available
const PHOTO_PLACEHOLDER: ImageSourcePropType = {
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
}

const { width: screenWidth } = Dimensions.get('window')

const CARD_WIDTH = screenWidth - 48

// Behind-card stack constants — matching Stitch: 3 cards behind + main
// Back Card 3: rotate 4deg, scale 0.98, translateY 8, opacity 0.60
const STACKED_CARD_SCALE_3 = 0.94
const STACKED_CARD_TRANSLATE_Y_3 = -24
const STACKED_CARD_ROTATION_3 = 4

// Back Card 2: rotate -3deg, scale 0.99, translateY 4, opacity 0.80
const STACKED_CARD_SCALE_2 = 0.97
const STACKED_CARD_TRANSLATE_Y_2 = -16
const STACKED_CARD_ROTATION_2 = -3

// Back Card 1: rotate 1deg, translateY 2, opacity 0.90
const STACKED_CARD_SCALE_1 = 0.99
const STACKED_CARD_TRANSLATE_Y_1 = -8
const STACKED_CARD_ROTATION_1 = 1

// Lustre design tokens — Stitch palette
const COPPER = '#894d0d'
const CHARCOAL = '#2C2421'
const SURFACE = '#fff8f6'
const ON_SURFACE = '#211a17'

// Tonal gradient background colors (Stitch: rgba(184,115,51,0.08) → rgba(253,248,243,1))
const GRADIENT_TOP = 'rgba(184,115,51,0.08)'
const GRADIENT_BOTTOM = 'rgba(253,248,243,1)'

export function DiscoverScreen() {
  const discovery = useDiscovery()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchVisible, setMatchVisible] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<any>(null)
  const [likePressed, setLikePressed] = useState(false)
  const [passPressed, setPassPressed] = useState(false)

  const currentProfile = discovery.profiles[currentIndex]

  const handleSwipedRight = useCallback(async () => {
    if (!currentProfile) return
    const result = await discovery.swipe(currentProfile.userId, 'LIKE')
    if (result.matched) {
      setMatchedProfile({
        displayName: currentProfile.displayName,
        photo: currentProfile.photos?.[0],
      })
      setMatchVisible(true)
    }
    setCurrentIndex((prev) => prev + 1)
  }, [currentProfile, discovery])

  const handleSwipedLeft = useCallback(async () => {
    if (!currentProfile) return
    await discovery.swipe(currentProfile.userId, 'PASS')
    setCurrentIndex((prev) => prev + 1)
  }, [currentProfile, discovery])

  const { gesture, cardAnimatedStyle, likeOpacity, nopeOpacity, resetValues } = useSwipeGesture({
    onSwipedLeft: handleSwipedLeft,
    onSwipedRight: handleSwipedRight,
  })

  const handleLikeButton = async () => {
    if (!currentProfile || discovery.isSwiping) return
    setLikePressed(true)
    const result = await discovery.swipe(currentProfile.userId, 'LIKE')
    if (result.matched) {
      setMatchedProfile({
        displayName: currentProfile.displayName,
        photo: currentProfile.photos?.[0],
      })
      setMatchVisible(true)
    }
    setCurrentIndex((prev) => prev + 1)
    resetValues()
    setLikePressed(false)
  }

  const handlePassButton = async () => {
    if (!currentProfile || discovery.isSwiping) return
    setPassPressed(true)
    await discovery.swipe(currentProfile.userId, 'PASS')
    setCurrentIndex((prev) => prev + 1)
    resetValues()
    setPassPressed(false)
  }

  // Back Card 1 (closest behind main) — 1deg, scale 0.99
  const behindCard1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: STACKED_CARD_SCALE_1 },
      { translateY: STACKED_CARD_TRANSLATE_Y_1 },
      { rotate: `${STACKED_CARD_ROTATION_1}deg` },
    ],
    opacity: 0.9,
  }))

  // Back Card 2 — -3deg, scale 0.97
  const behindCard2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: STACKED_CARD_SCALE_2 },
      { translateY: STACKED_CARD_TRANSLATE_Y_2 },
      { rotate: `${STACKED_CARD_ROTATION_2}deg` },
    ],
    opacity: 0.8,
  }))

  // Back Card 3 (furthest back) — 4deg, scale 0.94
  const behindCard3Style = useAnimatedStyle(() => ({
    transform: [
      { scale: STACKED_CARD_SCALE_3 },
      { translateY: STACKED_CARD_TRANSLATE_Y_3 },
      { rotate: `${STACKED_CARD_ROTATION_3}deg` },
    ],
    opacity: 0.6,
  }))

  if (discovery.isLoading) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <LinearGradient
          colors={[GRADIENT_TOP, GRADIENT_BOTTOM]}
          style={styles.flex}
        >
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner color={COPPER} size="large" />
          </YStack>
        </LinearGradient>
      </GestureHandlerRootView>
    )
  }

  if (!currentProfile || currentIndex >= discovery.profiles.length) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <LinearGradient
          colors={[GRADIENT_TOP, GRADIENT_BOTTOM]}
          style={styles.flex}
        >
          <YStack flex={1} paddingHorizontal={24}>
            <EmptyState
              title="Inga fler profiler just nu"
              description="Vi jobbar pa att hitta fler matchningar at dig. Kom tillbaka snart."
              action={{
                label: 'Uppdatera',
                onPress: () => {
                  setCurrentIndex(0)
                  discovery.refetch()
                },
              }}
            />
          </YStack>
        </LinearGradient>
      </GestureHandlerRootView>
    )
  }

  const nextProfile = discovery.profiles[currentIndex + 1]
  const nextNextProfile = discovery.profiles[currentIndex + 2]
  const thirdNextProfile = discovery.profiles[currentIndex + 3]

  const cardDims = getPolaroidDimensions(CARD_WIDTH)

  const getPhotoUrl = (profile: typeof currentProfile) =>
    profile?.photos?.[0]?.thumbnailLarge || profile?.photos?.[0]?.url

  const currentPhotoUrl = getPhotoUrl(currentProfile)
  const nextPhotoUrl = getPhotoUrl(nextProfile)
  const nextNextPhotoUrl = getPhotoUrl(nextNextProfile)
  const thirdNextPhotoUrl = getPhotoUrl(thirdNextProfile)

  // Caption: "Name, Age" on first line
  const currentCaption = [
    currentProfile.displayName,
    currentProfile.age ? `${currentProfile.age}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  // Tagline from bio — first sentence or first 60 chars
  const currentTagline = currentProfile.bio
    ? currentProfile.bio.split(/[.!?\n]/)[0]?.trim().slice(0, 60) || ''
    : ''

  return (
    <GestureHandlerRootView style={styles.flex}>
      <LinearGradient
        colors={[GRADIENT_TOP, GRADIENT_BOTTOM]}
        style={styles.container}
      >
        {/* Top Navigation Bar — glassmorphic */}
        <View style={styles.topNav}>
          <Pressable
            style={styles.navButton}
            accessibilityLabel="Meny"
            accessibilityRole="button"
          >
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
          <Text style={styles.logoText}>Lustre</Text>
          <Pressable
            style={styles.navButton}
            accessibilityLabel="Filter"
            accessibilityRole="button"
          >
            <Text style={styles.filterIcon}>⚙</Text>
          </Pressable>
        </View>

        {/* Card Stack — sized to the front card dimensions so it participates in the layout */}
        <View style={[styles.cardStack, { width: CARD_WIDTH, height: cardDims.cardHeight }]}>
          {/* Card 3 — furthest back */}
          {thirdNextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind3, behindCard3Style]}>
              <PolaroidCard
                cardWidth={CARD_WIDTH}
                imageSource={
                  thirdNextPhotoUrl
                    ? { uri: thirdNextPhotoUrl }
                    : PHOTO_PLACEHOLDER
                }
              />
            </Animated.View>
          )}

          {/* Card 2 — middle back */}
          {nextNextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind2, behindCard2Style]}>
              <PolaroidCard
                cardWidth={CARD_WIDTH}
                imageSource={
                  nextNextPhotoUrl
                    ? { uri: nextNextPhotoUrl }
                    : PHOTO_PLACEHOLDER
                }
              />
            </Animated.View>
          )}

          {/* Card 1 — closest behind */}
          {nextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind1, behindCard1Style]}>
              <PolaroidCard
                cardWidth={CARD_WIDTH}
                imageSource={
                  nextPhotoUrl
                    ? { uri: nextPhotoUrl }
                    : PHOTO_PLACEHOLDER
                }
              />
            </Animated.View>
          )}

          {/* Front (active) card — wrapped in GestureDetector for swipe */}
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.cardWrapper, styles.cardTop, cardAnimatedStyle]}>
              <PolaroidCard
                cardWidth={CARD_WIDTH}
                imageSource={
                  currentPhotoUrl
                    ? { uri: currentPhotoUrl }
                    : PHOTO_PLACEHOLDER
                }
                rotation={-2}
                accessibilityLabel={`Profil: ${currentCaption}`}
              >
                {/* Gradient overlay on photo — from-black/20 to transparent */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.20)', 'transparent']}
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0.4 }}
                  style={styles.photoGradientOverlay}
                />
                <SwipeStamp type="like" animatedStyle={likeOpacity} />
                <SwipeStamp type="nope" animatedStyle={nopeOpacity} />
              </PolaroidCard>

              {/* Custom caption in the white bottom strip */}
              <View
                style={[
                  styles.captionOverlay,
                  {
                    bottom: 0,
                    left: cardDims.borderSide,
                    right: cardDims.borderSide,
                    height: cardDims.cardHeight * 0.2670,
                  },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.captionName}>{currentCaption}</Text>
                {currentTagline ? (
                  <Text style={styles.captionTagline} numberOfLines={1}>
                    {currentTagline}
                  </Text>
                ) : null}
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Action Buttons — below card stack */}
        <View style={styles.actionButtonsContainer}>
          <DiscoveryActionButtons
            onPass={handlePassButton}
            onLike={handleLikeButton}
            disabled={discovery.isSwiping}
            passPressed={passPressed}
            likePressed={likePressed}
          />
        </View>
      </LinearGradient>

      <MatchAnimation
        visible={matchVisible}
        matchedProfile={matchedProfile}
        onDismiss={() => setMatchVisible(false)}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Top Navigation — glassmorphic bar
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 64,
    paddingTop: 8,
    backgroundColor: 'rgba(255,248,246,0.60)',
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: COPPER,
  } as any,
  logoText: {
    fontSize: 24,
    fontFamily: 'NotoSerif_700Bold',
    color: COPPER,
    letterSpacing: -1,
  } as any,
  filterIcon: {
    fontSize: 20,
    color: COPPER,
  } as any,

  // Card Stack
  cardStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
  cardTop: {
    zIndex: 4,
  },
  cardBehind1: {
    zIndex: 3,
  },
  cardBehind2: {
    zIndex: 2,
  },
  cardBehind3: {
    zIndex: 1,
  },

  // Photo gradient overlay
  photoGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },

  // Custom caption overlay in the polaroid white strip
  captionOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionName: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 24,
    color: ON_SURFACE,
    textAlign: 'center',
  } as any,
  captionTagline: {
    fontFamily: 'Caveat_400Regular',
    fontSize: 18,
    color: 'rgba(137,77,13,0.80)',
    textAlign: 'center',
    marginTop: 2,
  } as any,

  // Action Buttons Container
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    zIndex: 10,
  },
})
