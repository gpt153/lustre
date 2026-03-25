import { useState, useEffect } from 'react'
import { Animated, Dimensions } from 'react-native'
import { YStack, XStack, Text, Button, Image } from 'tamagui'

interface MatchAnimationProps {
  visible: boolean
  matchedProfile?: {
    displayName: string
    photo?: { url?: string; thumbnailLarge?: string }
  }
  onDismiss: () => void
}

export function MatchAnimation({ visible, matchedProfile, onDismiss }: MatchAnimationProps) {
  const scaleAnim = new Animated.Value(0)
  const opacityAnim = new Animated.Value(0)

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, scaleAnim, opacityAnim])

  if (!visible) return null

  const photoUrl = matchedProfile?.photo?.thumbnailLarge || matchedProfile?.photo?.url

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: opacityAnim,
        zIndex: 9999,
      }}
    >
      <YStack
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        alignItems="center"
        justifyContent="center"
        padding="$4"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <YStack
            backgroundColor="white"
            borderRadius="$4"
            padding="$6"
            alignItems="center"
            gap="$4"
            maxWidth={300}
          >
            <Text fontSize="$6" fontWeight="bold" color="$primary">
              It's a Match!
            </Text>

            {photoUrl && (
              <Image
                source={{ uri: photoUrl }}
                width={180}
                height={240}
                borderRadius="$3"
              />
            )}

            <XStack alignItems="center" gap="$2" justifyContent="center" flexWrap="wrap">
              <Text fontSize="$4" fontWeight="600">
                You and
              </Text>
              <Text fontSize="$4" fontWeight="bold" color="$primary">
                {matchedProfile?.displayName}
              </Text>
              <Text fontSize="$4" fontWeight="600">
                liked each other!
              </Text>
            </XStack>

            <Button
              size="$4"
              backgroundColor="$primary"
              color="white"
              onPress={onDismiss}
              borderRadius="$3"
              width="100%"
            >
              Continue
            </Button>
          </YStack>
        </Animated.View>
      </YStack>
    </Animated.View>
  )
}
