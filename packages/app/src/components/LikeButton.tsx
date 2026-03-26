import { YStack, Pressable, Text } from 'tamagui'
import Animated from 'react-native-reanimated'
import { usePressAnimation } from '../hooks/usePressAnimation'
import { useHaptics } from '../hooks/useHaptics'

interface LikeButtonProps {
  onPress: () => void
}

export function LikeButton({ onPress }: LikeButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(1.3)
  const { impactLight } = useHaptics()

  const handlePressIn = () => {
    impactLight()
    onPressIn()
  }

  const handlePressOut = () => {
    onPressOut()
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <YStack
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor="#F5EDE4"
          borderWidth={1}
          borderColor="#B87333"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={16}
            color="#B87333"
            fontWeight="700"
          >
            ♥
          </Text>
        </YStack>
      </Pressable>
    </Animated.View>
  )
}
