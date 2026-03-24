import { YStack, Text, H2 } from 'tamagui'

export default function DiscoverScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
      <H2 color="$primary">Discover</H2>
      <Text color="$textSecondary" marginTop="$2">Coming Soon</Text>
    </YStack>
  )
}
