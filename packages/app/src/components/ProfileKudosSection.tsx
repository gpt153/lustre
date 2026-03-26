import { YStack, XStack, Text } from 'tamagui'
import { trpc } from '@lustre/api'

interface ProfileKudosSectionProps {
  userId: string
}

export function ProfileKudosSection({ userId }: ProfileKudosSectionProps) {
  const { data, isLoading } = trpc.kudos.getProfileKudos.useQuery({ userId })

  if (isLoading || !data || data.totalCount === 0) return null

  return (
    <YStack gap="$2" paddingVertical="$3">
      <XStack alignItems="center" gap="$2">
        <Text fontSize="$5" fontWeight="bold">
          Kudos
        </Text>
        <Text fontSize="$4" color="$gray10">
          {data.totalCount} totalt
        </Text>
      </XStack>
      <XStack flexWrap="wrap" gap="$2">
        {data.badges.slice(0, 8).map((badge) => (
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
  )
}
