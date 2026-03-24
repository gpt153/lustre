'use client'

import { YStack, Text, H1 } from 'tamagui'
import { LustreButton } from '@lustre/ui'

export default function HomePage() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" minHeight="80vh">
      <H1 color="$primary" marginBottom="$4">Lustre</H1>
      <Text color="$textSecondary" fontSize="$3" marginBottom="$6" textAlign="center">
        A sex-positive social network
      </Text>
      <LustreButton>Coming Soon</LustreButton>
    </YStack>
  )
}
