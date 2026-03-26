import { useState, useCallback } from 'react'
import { StyleSheet, Dimensions, Pressable, View } from 'react-native'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { useDiscovery } from '../hooks/useDiscovery'
import { useSwipeGesture } from '../hooks/useSwipeGesture'
import { SwipeCard } from '../components/SwipeCard'
import { SwipeStamp } from '../components/SwipeStamp'
import { MatchAnimation } from '../components/MatchAnimation'

const { height: screenHeight } = Dimensions.get('window')

const STACKED_CARD_SCALE_1 = 0.95
const STACKED_CARD_SCALE_2 = 0.90
const STACKED_CARD_TRANSLATE_Y_1 = 10
const STACKED_CARD_TRANSLATE_Y_2 = 20

function PassIcon() {
  return (
    <Text style={styles.buttonIcon}>✕</Text>
  )
}

function LikeIcon() {
  return (
    <Text style={styles.buttonIcon}>♥</Text>
  )
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
    ],
  }))

  const behindCard2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: STACKED_CARD_SCALE_2 },
      { translateY: STACKED_CARD_TRANSLATE_Y_2 },
    ],
  }))

  if (discovery.isLoading) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
          <Spinner color="$primary" size="large" />
        </YStack>
      </GestureHandlerRootView>
    )
  }

  if (!currentProfile || currentIndex >= discovery.profiles.length) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$background"
          gap="$4"
        >
          <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
            No More Profiles
          </Text>
          <Text color="$textSecondary">Come back later for more matches!</Text>
          <Pressable
            style={styles.refreshButton}
            onPress={() => {
              setCurrentIndex(0)
              discovery.refetch()
            }}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </Pressable>
        </YStack>
      </GestureHandlerRootView>
    )
  }

  const nextProfile = discovery.profiles[currentIndex + 1]
  const nextNextProfile = discovery.profiles[currentIndex + 2]

  return (
    <GestureHandlerRootView style={styles.flex}>
      <YStack flex={1} backgroundColor="$background" paddingHorizontal="$3" paddingTop="$4" gap="$5">
        <View style={styles.cardStack}>
          {nextNextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind2, behindCard2Style]}>
              <SwipeCard profile={nextNextProfile} />
            </Animated.View>
          )}

          {nextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind1, behindCard1Style]}>
              <SwipeCard profile={nextProfile} />
            </Animated.View>
          )}

          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.cardWrapper, styles.cardTop, cardAnimatedStyle]}>
              <SwipeCard profile={currentProfile}>
                <SwipeStamp type="like" animatedStyle={likeOpacity} />
                <SwipeStamp type="nope" animatedStyle={nopeOpacity} />
              </SwipeCard>
            </Animated.View>
          </GestureDetector>
        </View>

        <XStack gap="$5" justifyContent="center" alignItems="center" paddingBottom="$6">
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

          <Pressable
            style={[
              styles.actionButton,
              styles.likeButton,
              likePressed && styles.likeButtonActive,
              discovery.isSwiping && styles.buttonDisabled,
            ]}
            onPress={handleLikeButton}
            disabled={discovery.isSwiping}
          >
            <LikeIcon />
          </Pressable>
        </XStack>
      </YStack>

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
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: screenHeight * 0.75 + STACKED_CARD_TRANSLATE_Y_2,
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
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#B87333',
    backgroundColor: '#FDF8F3',
  },
  passButton: {
    borderColor: '#B87333',
  },
  passButtonActive: {
    backgroundColor: '#E05A33',
    borderColor: '#E05A33',
  },
  likeButton: {
    borderColor: '#B87333',
  },
  likeButtonActive: {
    backgroundColor: '#D4A843',
    borderColor: '#D4A843',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 22,
    color: '#2C2421',
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#B87333',
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#FDF8F3',
    fontSize: 16,
    fontWeight: '600',
  },
})
