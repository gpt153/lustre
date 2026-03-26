'use client'

import { YStack } from 'tamagui'
import { InviteScreen } from '@lustre/app'

export default function InvitePage() {
  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      <InviteScreen />
    </YStack>
  )
}
