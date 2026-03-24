'use client'

import { YStack, Text, H2 } from 'tamagui'

export default function DiscoverPage() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
      <H2 color="$primary">Discover</H2>
      <Text color="$textSecondary" marginTop="$2">Coming Soon</Text>
    </YStack>
  )
}
