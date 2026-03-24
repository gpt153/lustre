import { YStack, Text, H2 } from 'tamagui'

export default function ChatScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
      <H2 color="$primary">Chat</H2>
      <Text color="$textSecondary" marginTop="$2">Coming Soon</Text>
    </YStack>
  )
}
