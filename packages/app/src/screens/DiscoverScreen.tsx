import { useState, useRef, useCallback } from 'react'
import { Animated, PanResponder, Dimensions } from 'react-native'
import { YStack, XStack, Text, Button, Image, Spinner } from 'tamagui'
import { useDiscovery } from '../hooks/useDiscovery'
import { MatchAnimation } from '../components/MatchAnimation'

const { width: screenWidth } = Dimensions.get('window')
const swipeThreshold = 120

export function DiscoverScreen() {
  const discovery = useDiscovery()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchVisible, setMatchVisible] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<any>(null)
  const pan = useRef(new Animated.ValueXY()).current
  const panResponderRef = useRef<any>(null)

  const currentProfile = discovery.profiles[currentIndex]

  const createPanResponder = useCallback(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        pan.x.setValue(gestureState.dx)
        pan.y.setValue(gestureState.dy)
      },
      onPanResponderRelease: async (evt, gestureState) => {
        const isSwipeRight = gestureState.dx > swipeThreshold
        const isSwipeLeft = gestureState.dx < -swipeThreshold

        if (isSwipeRight || isSwipeLeft) {
          const action = isSwipeRight ? 'LIKE' : 'PASS'

          if (currentProfile) {
            const result = await discovery.swipe(currentProfile.userId, action)

            if (result.matched) {
              setMatchedProfile({
                displayName: currentProfile.displayName,
                photo: currentProfile.photos?.[0],
              })
              setMatchVisible(true)
            }
          }

          Animated.timing(pan, {
            toValue: { x: isSwipeRight ? screenWidth : -screenWidth, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 })
            setCurrentIndex((prev) => prev + 1)
          })
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start()
        }
      },
    })
  }, [currentProfile, discovery, pan])

  if (!panResponderRef.current) {
    panResponderRef.current = createPanResponder()
  }

  if (discovery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner color="$primary" size="large" />
      </YStack>
    )
  }

  if (!currentProfile || currentIndex >= discovery.profiles.length) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" gap="$4">
        <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
          No More Profiles
        </Text>
        <Text color="$textSecondary">Come back later for more matches!</Text>
        <Button
          size="$4"
          backgroundColor="$primary"
          color="white"
          onPress={() => {
            setCurrentIndex(0)
            discovery.refetch()
          }}
        >
          Refresh
        </Button>
      </YStack>
    )
  }

  const photoUrl = currentProfile.photos?.[0]?.thumbnailLarge || currentProfile.photos?.[0]?.url

  const cardTransform = {
    transform: [
      {
        translateX: pan.x,
      },
      {
        translateY: pan.y,
      },
      {
        rotate: pan.x.interpolate({
          inputRange: [-screenWidth, 0, screenWidth],
          outputRange: ['-10deg', '0deg', '10deg'],
        }),
      },
    ],
  }

  return (
    <YStack flex={1} backgroundColor="$background" padding="$3" justifyContent="flex-start" gap="$4">
      <YStack height={500} alignItems="center" justifyContent="center">
        <Animated.View
          style={[
            {
              width: '90%',
              height: 480,
              borderRadius: 16,
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            },
            cardTransform,
          ]}
          {...panResponderRef.current?.panHandlers}
        >
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              width="100%"
              height={340}
              borderTopLeftRadius={16}
              borderTopRightRadius={16}
            />
          ) : (
            <YStack
              width="100%"
              height={340}
              backgroundColor="$gray2"
              alignItems="center"
              justifyContent="center"
              borderTopLeftRadius={16}
              borderTopRightRadius={16}
            >
              <Text color="$textSecondary">No photo</Text>
            </YStack>
          )}

          <YStack flex={1} padding="$3" justifyContent="space-between">
            <YStack gap="$1">
              <XStack alignItems="center" gap="$2">
                <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
                  {currentProfile.displayName}
                </Text>
                {currentProfile.age && (
                  <Text fontSize="$4" color="$textSecondary">
                    {currentProfile.age}
                  </Text>
                )}
              </XStack>

              {currentProfile.bio && (
                <Text
                  fontSize="$3"
                  color="$textSecondary"
                  numberOfLines={2}
                >
                  {currentProfile.bio}
                </Text>
              )}
            </YStack>
          </YStack>
        </Animated.View>
      </YStack>

      <XStack gap="$3" justifyContent="center" paddingBottom="$4">
        <Button
          size="$4"
          circular
          backgroundColor="$red9"
          color="white"
          onPress={async () => {
            if (currentProfile) {
              await discovery.swipe(currentProfile.userId, 'PASS')
              setCurrentIndex((prev) => prev + 1)
            }
          }}
          disabled={discovery.isSwiping}
        >
          ✕
        </Button>
        <Button
          size="$4"
          circular
          backgroundColor="$green9"
          color="white"
          onPress={async () => {
            if (currentProfile) {
              const result = await discovery.swipe(currentProfile.userId, 'LIKE')
              if (result.matched) {
                setMatchedProfile({
                  displayName: currentProfile.displayName,
                  photo: currentProfile.photos?.[0],
                })
                setMatchVisible(true)
              }
              setCurrentIndex((prev) => prev + 1)
            }
          }}
          disabled={discovery.isSwiping}
        >
          ♥
        </Button>
      </XStack>

      <MatchAnimation
        visible={matchVisible}
        matchedProfile={matchedProfile}
        onDismiss={() => setMatchVisible(false)}
      />
    </YStack>
  )
}
