import React, { useMemo, type ReactNode } from 'react'
import {
  View,
  Image,
  Text,
  Pressable,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { getPolaroidDimensions } from '@lustre/tokens'

const WARM_SHADOW = {
  shadowColor: '#2E1500',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 24,
  elevation: 4,
}

// Inlined spring config from apps/mobile/constants/animations.ts
const SPRING_SNAPPY = { damping: 25, stiffness: 200, mass: 0.8 }
const PRESS_SCALE = 0.97

export interface PolaroidCardProps {
  /** Card width in pixels — drives all other dimensions via golden-ratio tokens */
  cardWidth: number
  /** Image source — URI or local require() */
  imageSource?: ImageSourcePropType
  /** Image URL string — resolved to { uri } */
  imageUrl?: string
  /** Alt text for the image (accessibility) */
  imageAlt?: string
  /** Optional caption text rendered in the white bottom strip */
  caption?: string
  /** Rotation in degrees (default 0) */
  rotation?: number
  /** Press handler */
  onPress?: () => void
  /** Absolute overlay rendered on top of the image area */
  children?: ReactNode
  /** Additional style applied to the outermost animated container */
  style?: ViewStyle
  /** Accessibility label for screen readers */
  accessibilityLabel?: string
}

export function PolaroidCard({
  cardWidth,
  imageSource,
  imageUrl,
  imageAlt,
  caption,
  rotation = 0,
  onPress,
  children,
  style,
  accessibilityLabel,
}: PolaroidCardProps) {
  const dims = useMemo(() => getPolaroidDimensions(cardWidth), [cardWidth])
  const resolvedSource = imageUrl ? { uri: imageUrl } : imageSource!

  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation}deg` }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(PRESS_SCALE, SPRING_SNAPPY)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_SNAPPY)
  }

  const captionFontSize = Math.max(14, cardWidth * 0.06)

  const cardStyle: ViewStyle = {
    width: dims.cardWidth,
    height: dims.cardHeight,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    ...WARM_SHADOW,
  }

  const imageContainerStyle: ViewStyle = {
    position: 'absolute',
    top: dims.borderTop,
    left: dims.borderSide,
    width: dims.imageWidth,
    height: dims.imageHeight,
    overflow: 'hidden',
  }

  const captionContainerStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: dims.borderSide,
    right: dims.borderSide,
    height: dims.cardHeight * 0.2670,
    alignItems: 'center',
    justifyContent: 'center',
  }

  const content = (
    <View style={cardStyle}>
      {/* Image area */}
      <View style={imageContainerStyle}>
        <Image
          source={resolvedSource}
          style={{ width: dims.imageWidth, height: dims.imageHeight }}
          resizeMode="cover"
          accessibilityLabel={imageAlt}
        />
        {/* Overlay children sit absolutely on top of the image */}
        {children != null && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {children}
          </View>
        )}
      </View>

      {/* Caption in the white bottom strip */}
      {caption != null && (
        <View style={captionContainerStyle} pointerEvents="none">
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Caveat_400Regular',
              fontSize: captionFontSize,
              color: '#2C2421',
              textAlign: 'center',
              paddingHorizontal: 4,
            }}
          >
            {caption}
          </Text>
        </View>
      )}
    </View>
  )

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPress ? handlePressIn : undefined}
        onPressOut={onPress ? handlePressOut : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={onPress ? 'button' : 'image'}
      >
        {content}
      </Pressable>
    </Animated.View>
  )
}
