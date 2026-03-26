import { YStack, Pressable, Text } from 'tamagui'

interface LikeButtonProps {
  onPress: () => void
}

export function LikeButton({ onPress }: LikeButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <YStack
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor="#F5EDE4"
        borderWidth={1}
        borderColor="#B87333"
        alignItems="center"
        justifyContent="center"
        pressStyle={{
          backgroundColor: '#D4A843',
        }}
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
  )
}
