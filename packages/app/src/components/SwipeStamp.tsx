import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native'

interface SwipeStampProps {
  type: 'like' | 'nope'
  animatedStyle: ReturnType<typeof import('react-native-reanimated').useAnimatedStyle>
}

export function SwipeStamp({ type, animatedStyle }: SwipeStampProps) {
  const isLike = type === 'like'

  return (
    <Animated.View style={[styles.container, isLike ? styles.likePosition : styles.nopePosition, animatedStyle]}>
      <Animated.Text
        style={[
          styles.text,
          isLike ? styles.likeText : styles.nopeText,
          isLike ? styles.likeRotation : styles.nopeRotation,
        ]}
      >
        {isLike ? 'LIKE' : 'NOPE'}
      </Animated.Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 24,
    zIndex: 10,
    pointerEvents: 'none',
  },
  likePosition: {
    left: 20,
  },
  nopePosition: {
    right: 20,
  },
  text: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    borderWidth: 3,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeText: {
    color: '#7A9E7E',
    borderColor: '#7A9E7E',
    textShadowColor: '#7A9E7E',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  nopeText: {
    color: '#E05A33',
    borderColor: '#E05A33',
    textShadowColor: '#E05A33',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  likeRotation: {
    transform: [{ rotate: '-15deg' }],
  },
  nopeRotation: {
    transform: [{ rotate: '15deg' }],
  },
})
