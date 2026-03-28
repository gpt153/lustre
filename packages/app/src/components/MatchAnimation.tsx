import { useState, useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  ViewStyle,
  NativeModules,
} from 'react-native'
import { YStack, XStack, Text, Image, Button } from 'tamagui'
import { useHaptics } from '../hooks/useHaptics'

interface MatchAnimationProps {
  visible: boolean
  matchedProfile?: {
    displayName: string
    photo?: { url?: string; thumbnailLarge?: string }
  }
  onDismiss: () => void
}

let LottieView: any = null
let lottieAnimationData: any = null

try {
  if (Platform.OS !== 'web') {
    LottieView = require('lottie-react-native').default
    lottieAnimationData = require('../assets/animations/match-celebration.json')
  }
} catch (e) {
  LottieView = null
  lottieAnimationData = null
}

const ANIMATION_COLORS = {
  copper: '#B87333',
  gold: '#D4A843',
  warmWhite: '#FDF8F3',
  warmCream: '#F5EDE4',
  charcoal: '#2C2421',
  warmGray: '#8B7E74',
}

export function MatchAnimation({ visible, matchedProfile, onDismiss }: MatchAnimationProps) {
  const { impactMedium, impactLight } = useHaptics()

  const backdropOpacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.8)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const shimmerTranslate = useRef(new Animated.Value(-180)).current
  const dismissTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!visible) {
      return
    }

    // Reset all animations
    backdropOpacity.setValue(0)
    cardScale.setValue(0.8)
    cardOpacity.setValue(0)
    textOpacity.setValue(0)
    shimmerTranslate.setValue(-180)

    // Animation sequence
    Animated.sequence([
      // 1. Backdrop fade in (200ms)
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // 2. Card scales up and fades in (400ms) + medium haptic
      Animated.parallel([
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 3. Lottie plays during this phase (1500ms) - overlaps with card animation
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After sequence, trigger haptic and show text
      impactMedium()

      // Text fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()

      // Shimmer effect
      Animated.timing(shimmerTranslate, {
        toValue: 180,
        duration: 1000,
        useNativeDriver: true,
      }).start()
    })

    // Auto-dismiss after 4 seconds
    dismissTimeout.current = setTimeout(() => {
      handleDismiss()
    }, 4000)

    return () => {
      if (dismissTimeout.current) {
        clearTimeout(dismissTimeout.current)
      }
    }
  }, [visible, backdropOpacity, cardScale, cardOpacity, textOpacity, shimmerTranslate, impactMedium])

  const handleDismiss = () => {
    if (dismissTimeout.current) {
      clearTimeout(dismissTimeout.current)
    }

    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss()
    })
  }

  if (!visible) return null

  const photoUrl = matchedProfile?.photo?.thumbnailLarge || matchedProfile?.photo?.url
  const screenWidth = Dimensions.get('window').width

  const backdropStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: backdropOpacity,
    zIndex: 9999,
    backgroundColor: 'rgba(44, 36, 33, 0.85)',
  }

  const cardStyle = {
    transform: [{ scale: cardScale }],
    opacity: cardOpacity,
  }

  return (
    <Animated.View style={backdropStyle}>
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$md"
          pointerEvents="box-none"
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View style={[cardStyle, { width: '100%' }]}>
              <YStack
                backgroundColor={ANIMATION_COLORS.warmCream}
                borderRadius={20}
                padding="$lg"
                alignItems="center"
                gap="$md"
                maxWidth={300}
                alignSelf="center"
                borderWidth={1}
                borderColor={ANIMATION_COLORS.copper}
                shadowColor={ANIMATION_COLORS.copper}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.15}
                shadowRadius={8}
              >
                {/* Lottie Animation — only on native */}
                {LottieView && lottieAnimationData && Platform.OS !== 'web' && (
                  <LottieView
                    source={lottieAnimationData}
                    autoPlay
                    loop={false}
                    speed={1}
                    style={{ width: 160, height: 160 }}
                  />
                )}

                {/* Profile Photo with Shimmer */}
                {photoUrl && (
                  <YStack position="relative" width={180} height={240}>
                    <Image
                      source={{ uri: photoUrl }}
                      width={180}
                      height={240}
                      borderRadius={12}
                    />

                    {/* Shimmer Overlay */}
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          transform: [
                            {
                              translateX: shimmerTranslate,
                            },
                          ],
                        },
                        {
                          borderRadius: 12,
                        },
                      ]}
                    >
                      <YStack
                        flex={1}
                        width="100%"
                        background="linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)"
                      />
                    </Animated.View>
                  </YStack>
                )}

                {/* "It's a Match!" Text */}
                <Animated.View style={{ opacity: textOpacity }}>
                  <Text
                    fontSize={28}
                    fontWeight="700"
                    color={ANIMATION_COLORS.gold}
                    textAlign="center"
                  >
                    It's a Match!
                  </Text>
                </Animated.View>

                {/* Match Info */}
                <Animated.View style={{ opacity: textOpacity }}>
                  <XStack
                    alignItems="center"
                    gap="$xs"
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color={ANIMATION_COLORS.warmGray}
                    >
                      You and
                    </Text>
                    <Text
                      fontSize="$4"
                      fontWeight="700"
                      color={ANIMATION_COLORS.copper}
                    >
                      {matchedProfile?.displayName || 'them'}
                    </Text>
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color={ANIMATION_COLORS.warmGray}
                    >
                      gillade dig tillbaka!
                    </Text>
                  </XStack>
                </Animated.View>

                {/* Continue Button */}
                <Animated.View style={{ opacity: textOpacity, width: '100%' }}>
                  <Button
                    size="$4"
                    backgroundColor={ANIMATION_COLORS.copper}
                    color="white"
                    onPress={handleDismiss}
                    borderRadius={12}
                    width="100%"
                    fontWeight="700"
                    pressStyle={{
                      backgroundColor: '#A85D2C',
                      transform: [{ scale: 0.98 }],
                    }}
                  >
                    Continue
                  </Button>
                </Animated.View>
              </YStack>
            </Animated.View>
          </TouchableWithoutFeedback>
        </YStack>
      </TouchableWithoutFeedback>
    </Animated.View>
  )
}
