'use client'

import { YStack } from 'tamagui'
import { MigrationScreen } from '@lustre/app'

export default function MigrationPage() {
  return (
    <YStack flex={1} width="100%" maxWidth={640} marginHorizontal="auto">
      <MigrationScreen />
    </YStack>
  )
}
