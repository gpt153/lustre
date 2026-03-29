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

// Transparent 1×1 PNG as a safe fallback when no profile photo is available
const PHOTO_PLACEHOLDER: ImageSourcePropType = {
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
}

const { width: screenWidth } = Dimensions.get('window')

const CARD_WIDTH = screenWidth - 48

// Behind-card stack constants
const STACKED_CARD_SCALE_1 = 0.95
const STACKED_CARD_SCALE_2 = 0.90
const STACKED_CARD_TRANSLATE_Y_1 = -10
const STACKED_CARD_TRANSLATE_Y_2 = -20
const STACKED_CARD_ROTATION_1 = 2
const STACKED_CARD_ROTATION_2 = -2

// Lustre design tokens
const COPPER = '#894d0d'
const GOLD = '#D4A843'
const CHARCOAL = '#2C2421'
const WARM_WHITE = '#fef8f3'
const EMBER = '#E05A33'
const SURFACE_CONTAINER = '#f2ede8'

function PassIcon() {
  return <Text style={styles.passIconText}>✕</Text>
}

function SuperLikeIcon() {
  return <Text style={styles.superLikeIconText}>★</Text>
}

function LikeIcon() {
  return <Text style={styles.likeIconText}>♥</Text>
}

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

  const behindCard1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: STACKED_CARD_SCALE_1 },
      { translateY: STACKED_CARD_TRANSLATE_Y_1 },
      { rotate: `${STACKED_CARD_ROTATION_1}deg` },
    ],
  }))

  const behindCard2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: STACKED_CARD_SCALE_2 },
      { translateY: STACKED_CARD_TRANSLATE_Y_2 },
      { rotate: `${STACKED_CARD_ROTATION_2}deg` },
    ],
  }))

  if (discovery.isLoading) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={SURFACE_CONTAINER}>
          <Spinner color={COPPER} size="large" />
        </YStack>
      </GestureHandlerRootView>
    )
  }

  if (!currentProfile || currentIndex >= discovery.profiles.length) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <YStack flex={1} backgroundColor={SURFACE_CONTAINER} paddingHorizontal={24}>
          <EmptyState
            title="Inga fler profiler just nu"
            description="Vi jobbar på att hitta fler matchningar åt dig. Kom tillbaka snart."
            action={{
              label: 'Uppdatera',
              onPress: () => {
                setCurrentIndex(0)
                discovery.refetch()
              },
            }}
          />
        </YStack>
      </GestureHandlerRootView>
    )
  }

  const nextProfile = discovery.profiles[currentIndex + 1]
  const nextNextProfile = discovery.profiles[currentIndex + 2]

  const cardDims = getPolaroidDimensions(CARD_WIDTH)

  const getPhotoUrl = (profile: typeof currentProfile) =>
    profile?.photos?.[0]?.thumbnailLarge || profile?.photos?.[0]?.url

  const currentPhotoUrl = getPhotoUrl(currentProfile)
  const nextPhotoUrl = getPhotoUrl(nextProfile)
  const nextNextPhotoUrl = getPhotoUrl(nextNextProfile)

  const currentCaption = [
    currentProfile.displayName,
    currentProfile.age ? `${currentProfile.age}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.topNav}>
          <Text style={styles.logoText}>Lustre</Text>
          <Pressable style={styles.filterButton}>
            <Text style={styles.filterIcon}>☰</Text>
          </Pressable>
        </View>

        {/* Card Stack — sized to the front card dimensions so it participates in the layout */}
        <View style={[styles.cardStack, { width: CARD_WIDTH, height: cardDims.cardHeight }]}>
          {/* Card at back of stack */}
          {nextNextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind2, behindCard2Style]}>
              <PolaroidCard
                cardWidth={CARD_WIDTH}
                imageSource={
                  nextNextPhotoUrl
                    ? { uri: nextNextPhotoUrl }
                    : PHOTO_PLACEHOLDER
                }
                shadow="md"
              />
            </Animated.View>
          )}

          {/* Middle card */}
          {nextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind1, behindCard1Style]}>
              <PolaroidCard
                cardWidth={CARD_WIDTH}
                imageSource={
                  nextPhotoUrl
                    ? { uri: nextPhotoUrl }
                    : PHOTO_PLACEHOLDER
                }
                shadow="md"
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
                caption={currentCaption}
                shadow="lg"
              >
                <SwipeStamp type="like" animatedStyle={likeOpacity} />
                <SwipeStamp type="nope" animatedStyle={nopeOpacity} />
              </PolaroidCard>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Action Buttons — below card stack */}
        <View style={[styles.actionRow, { marginTop: cardDims.cardHeight * 0.05 }]}>
          {/* Pass */}
          <Pressable
            style={[
              styles.actionButton,
              styles.passButton,
              passPressed && styles.passButtonActive,
              discovery.isSwiping && styles.buttonDisabled,
            ]}
            onPress={handlePassButton}
            disabled={discovery.isSwiping}
          >
            <PassIcon />
          </Pressable>

          {/* Super Like */}
          <Pressable
            style={[
              styles.actionButton,
              styles.superLikeButton,
              discovery.isSwiping && styles.buttonDisabled,
            ]}
            disabled={discovery.isSwiping}
          >
            <SuperLikeIcon />
          </Pressable>

          {/* Like */}
          <Pressable
            style={[
              styles.actionButton,
              likePressed && styles.likeButtonActive,
              discovery.isSwiping && styles.buttonDisabled,
            ]}
            onPress={handleLikeButton}
            disabled={discovery.isSwiping}
          >
            <LinearGradient
              colors={['#894d0d', '#a76526']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.likeGradient}
            >
              <LikeIcon />
            </LinearGradient>
          </Pressable>
        </View>
      </View>

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
    backgroundColor: SURFACE_CONTAINER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Top Navigation
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
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'NotoSerif_700Bold',
    color: COPPER,
    letterSpacing: -0.5,
  } as any,
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
    color: COPPER,
  } as any,

  // Card Stack — dimensions set inline from cardDims in JSX
  cardStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
  cardTop: {
    zIndex: 3,
  },
  cardBehind1: {
    zIndex: 2,
  },
  cardBehind2: {
    zIndex: 1,
  },

  // Action Buttons Row
  actionRow: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CHARCOAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  passButton: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#1d1b19',
  },
  passButtonActive: {
    backgroundColor: EMBER,
  },
  passIconText: {
    fontSize: 26,
    color: WARM_WHITE,
    fontWeight: '300',
  } as any,
  superLikeButton: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  superLikeIconText: {
    fontSize: 28,
    color: CHARCOAL,
  } as any,
  likeButtonActive: {
    opacity: 0.85,
  },
  likeIconText: {
    fontSize: 26,
    color: WARM_WHITE,
  } as any,
  likeGradient: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CHARCOAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})
