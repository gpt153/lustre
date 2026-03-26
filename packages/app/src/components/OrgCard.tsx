import { YStack, XStack, Text, Button } from 'tamagui'
import { CardBase } from '@lustre/ui'

interface OrgCardProps {
  org: {
    id: string
    name: string
    description: string | null
    type: string
    verified: boolean
    _count: { members: number }
  }
  onPress: (orgId: string) => void
}

export function OrgCard({ org, onPress }: OrgCardProps) {
  const descriptionPreview = org.description
    ? org.description.length > 100
      ? org.description.substring(0, 100) + '...'
      : org.description
    : 'No description'

  return (
    <CardBase
      asChild
      onPress={() => onPress(org.id)}
    >
      <YStack width="100%" gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontWeight="600" color="$text" fontSize="$4" flex={1}>
            {org.name}
          </Text>
          <XStack
            backgroundColor="$blue100"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius={6}
          >
            <Text
              fontSize="$1"
              fontWeight="600"
              color="$primary"
            >
              {org.type}
            </Text>
          </XStack>
        </XStack>

        <Text color="$textSecondary" fontSize="$2" numberOfLines={2}>
          {descriptionPreview}
        </Text>

        <XStack gap="$2" alignItems="center">
          <Text color="$textSecondary" fontSize="$1">
            {org._count.members} {org._count.members === 1 ? 'member' : 'members'}
          </Text>
          {org.verified && (
            <Text color="#D4A843" fontSize="$1" fontWeight="600">
              ✓ Verified
            </Text>
          )}
        </XStack>
      </YStack>
    </CardBase>
  )
}
