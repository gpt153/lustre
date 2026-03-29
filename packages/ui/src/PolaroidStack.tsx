import React, { useCallback, useState } from 'react'
import { ImageSourcePropType, View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { PolaroidCard } from './PolaroidCard'

const SPRING_CONFIG = { damping: 20, stiffness: 90, mass: 1 }

// Stack positions: index 0 = front, 1 = middle, 2 = back
const STACK_LAYERS = [
  { rotation: 0, scale: 1, zIndex: 3 },
  { rotation: 3, scale: 0.95, zIndex: 2 },
  { rotation: -2, scale: 0.9, zIndex: 1 },
] as const

export interface PolaroidStackProps {
  images: ImageSourcePropType[]
  cardWidth: number
  captions?: string[]
  onCardPress?: (index: number) => void
}

export function PolaroidStack({
  images,
  cardWidth,
  captions,
  onCardPress,
}: PolaroidStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Animated exit scale for the front card — springs down then snaps back
  const frontScale = useSharedValue(1)
  const frontOpacity = useSharedValue(1)

  const visibleCount = Math.min(images.length, 3)

  const advanceIndex = useCallback(
    (fromIndex: number) => {
      setCurrentIndex((fromIndex + 1) % images.length)
      frontScale.value = 1
      frontOpacity.value = 1
    },
    [images.length, frontScale, frontOpacity]
  )

  const handlePress = useCallback(() => {
    if (images.length <= 1) {
      onCardPress?.(currentIndex)
      return
    }
    onCardPress?.(currentIndex)

    // Animate front card out
    frontScale.value = withSpring(0.85, SPRING_CONFIG)
    frontOpacity.value = withSpring(0, SPRING_CONFIG, () => {
      'worklet'
      runOnJS(advanceIndex)(currentIndex)
    })
  }, [images.length, currentIndex, onCardPress, frontScale, frontOpacity, advanceIndex])

  const frontAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: frontScale.value }],
    opacity: frontOpacity.value,
  }))

  // Render back-to-front so front card is on top in paint order too
  const renderOrder = Array.from({ length: visibleCount }, (_, i) => visibleCount - 1 - i)

  return (
    <View style={[styles.container, { width: cardWidth, height: cardWidth * 1.25 }]}>
      {renderOrder.map((stackPos) => {
        const imgIdx = (currentIndex + stackPos) % images.length
        const layer = STACK_LAYERS[stackPos]
        const isFront = stackPos === 0

        return (
          <Animated.View
            key={stackPos}
            style={[
              StyleSheet.absoluteFillObject,
              {
                zIndex: layer.zIndex,
                transform: [
                  { rotate: `${layer.rotation}deg` },
                  { scale: layer.scale },
                ],
              },
              isFront ? frontAnimStyle : undefined,
            ]}
          >
            <PolaroidCard
              cardWidth={cardWidth}
              imageSource={images[imgIdx]}
              caption={captions?.[imgIdx]}
              rotation={0}
              onPress={isFront ? handlePress : undefined}
              accessibilityLabel={
                isFront
                  ? `Polaroid bild ${imgIdx + 1} av ${images.length}. Tryck för att bläddra.`
                  : undefined
              }
            />
          </Animated.View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
})
