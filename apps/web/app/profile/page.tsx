'use client'

import { YStack, Text, H2 } from 'tamagui'

export default function ProfilePage() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
      <H2 color="$primary">Profile</H2>
      <Text color="$textSecondary" marginTop="$2">Coming Soon</Text>
    </YStack>
  )
}
