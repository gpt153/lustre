import { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate, runOnJS } from 'react-native-reanimated'
import { Gesture } from 'react-native-gesture-handler'
import { Dimensions } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

const SWIPE_THRESHOLD_OFFSET = 100
const SWIPE_THRESHOLD_VELOCITY = 500
const FLY_OFF_DURATION = 200

interface UseSwipeGestureOptions {
  onSwipedLeft: () => void
  onSwipedRight: () => void
}

export function useSwipeGesture({ onSwipedLeft, onSwipedRight }: UseSwipeGestureOptions) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const cardRotation = useSharedValue(0)

  const resetCard = () => {
    'worklet'
    translateX.value = withSpring(0, { damping: 20, stiffness: 90 })
    translateY.value = withSpring(0, { damping: 20, stiffness: 90 })
    cardRotation.value = withSpring(0, { damping: 20, stiffness: 90 })
  }

  const flyOff = (direction: 'left' | 'right', callback: () => void) => {
    'worklet'
    const targetX = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5
    translateX.value = withTiming(targetX, { duration: FLY_OFF_DURATION }, () => {
      runOnJS(callback)()
    })
  }

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet'
      translateX.value = event.translationX
      translateY.value = event.translationY
      cardRotation.value = interpolate(
        event.translationX,
        [-screenWidth, 0, screenWidth],
        [-15, 0, 15],
      )
    })
    .onEnd((event) => {
      'worklet'
      const swipedRight =
        event.translationX > SWIPE_THRESHOLD_OFFSET || event.velocityX > SWIPE_THRESHOLD_VELOCITY
      const swipedLeft =
        event.translationX < -SWIPE_THRESHOLD_OFFSET || event.velocityX < -SWIPE_THRESHOLD_VELOCITY

      if (swipedRight) {
        flyOff('right', onSwipedRight)
      } else if (swipedLeft) {
        flyOff('left', onSwipedLeft)
      } else {
        resetCard()
      }
    })

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${cardRotation.value}deg` },
    ],
  }))

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD_OFFSET], [0, 1], 'clamp'),
  }))

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD_OFFSET, 0], [1, 0], 'clamp'),
  }))

  const resetValues = () => {
    translateX.value = 0
    translateY.value = 0
    cardRotation.value = 0
  }

  return {
    gesture,
    cardAnimatedStyle,
    likeOpacity,
    nopeOpacity,
    resetValues,
  }
}
