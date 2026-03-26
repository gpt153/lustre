'use client'

import { use } from 'react'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { ProfileViewScreen } from '@lustre/app/src/screens/ProfileViewScreen'

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const { data: profile, isLoading, error } = trpc.profile.getPublic.useQuery({ userId })
  const kudosQuery = trpc.kudos.getProfileKudos.useQuery({ userId })

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

      {kudosQuery.data && kudosQuery.data.totalCount > 0 && (
        <YStack gap="$2" paddingVertical="$3" marginTop="$4" borderTopWidth={1} borderTopColor="$borderColor" paddingTop="$4">
          <XStack alignItems="center" gap="$2">
            <Text fontSize="$5" fontWeight="bold">
              Kudos
            </Text>
            <Text fontSize="$4" color="$gray10">
              {kudosQuery.data.totalCount} totalt
            </Text>
          </XStack>
          <XStack flexWrap="wrap" gap="$2">
            {kudosQuery.data.badges.slice(0, 8).map((badge) => (
              <XStack
                key={badge.badgeId}
                backgroundColor="$gray3"
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius="$4"
                alignItems="center"
                gap="$1"
              >
                <Text fontSize="$3" fontWeight="500">
                  {badge.name}
                </Text>
                <Text fontSize="$2" color="$gray10">
                  x{badge.count}
                </Text>
              </XStack>
            ))}
          </XStack>
        </YStack>
      )}
    </div>
  )
}
