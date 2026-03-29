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

// Stack positions: index 0 = front, 1–4 = background layers
const STACK_LAYERS = [
  { rotation: 0, scale: 1, opacity: 1, translateX: 0, translateY: 0, zIndex: 5 },
  { rotation: 3, scale: 0.95, opacity: 0.9, translateX: 2, translateY: -2, zIndex: 4 },
  { rotation: -2, scale: 0.90, opacity: 0.8, translateX: -3, translateY: 1, zIndex: 3 },
  { rotation: 6, scale: 0.85, opacity: 0.7, translateX: 4, translateY: -1, zIndex: 2 },
  { rotation: -5, scale: 0.80, opacity: 0.6, translateX: -6, translateY: 2, zIndex: 1 },
] as const

export interface PolaroidStackProps {
  images: ImageSourcePropType[]
  cardWidth: number
  captions?: string[]
  onCardPress?: (index: number) => void
  activeIndex?: number
  onSwipe?: (newIndex: number) => void
}

export function PolaroidStack({
  images,
  cardWidth,
  captions,
  onCardPress,
  activeIndex,
  onSwipe,
}: PolaroidStackProps) {
  const [internalIndex, setInternalIndex] = useState(0)
  const currentIndex = activeIndex ?? internalIndex

  // Animated exit scale for the front card — springs down then snaps back
  const frontScale = useSharedValue(1)
  const frontOpacity = useSharedValue(1)

  const visibleCount = Math.min(images.length, 5)

  const advanceIndex = useCallback(
    (fromIndex: number) => {
      const newIndex = (fromIndex + 1) % images.length
      if (activeIndex === undefined) {
        setInternalIndex(newIndex)
      }
      onSwipe?.(newIndex)
      frontScale.value = 1
      frontOpacity.value = 1
    },
    [images.length, frontScale, frontOpacity, activeIndex, onSwipe]
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

  // Container height: card height (preserving Polaroid 600 88:107 ratio) + space for dots
  const containerHeight = cardWidth / (88 / 107) + 32

  // Render back-to-front so front card is on top in paint order too
  const renderOrder = Array.from({ length: visibleCount }, (_, i) => visibleCount - 1 - i)

  return (
    <View style={[styles.container, { width: cardWidth, height: containerHeight, transform: [{ perspective: 1200 }] }]}>
      <View style={styles.stackArea}>
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
                  opacity: isFront ? undefined : layer.opacity,
                  transform: [
                    { translateX: layer.translateX },
                    { translateY: layer.translateY },
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

      {/* Swipe dot indicators */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                idx === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  stackArea: {
    flex: 1,
    position: 'relative',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#894d0d',
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(216,195,180,0.4)',
  },
})
