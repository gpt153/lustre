'use client'

import { use } from 'react'
import { YStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { ProfileViewScreen } from '@lustre/app/src/screens/ProfileViewScreen'

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const { data: profile, isLoading, error } = trpc.profile.getPublic.useQuery({ userId })

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner size="large" color="$primary" />
      </YStack>
    )
  }

  if (error || !profile) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">Profile not found</Text>
      </YStack>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <ProfileViewScreen profile={profile as any} />
    </div>
  )
}
