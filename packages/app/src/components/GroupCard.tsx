import { YStack, XStack, Text, Button } from 'tamagui'

interface GroupCardProps {
  group: {
    id: string
    name: string
    description: string | null
    visibility: string
    _count: { members: number }
  }
  onPress: (groupId: string) => void
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const descriptionPreview = group.description
    ? group.description.length > 100
      ? group.description.substring(0, 100) + '...'
      : group.description
    : 'No description'

  return (
    <Button
      unstyledAll
      onPress={() => onPress(group.id)}
      backgroundColor="$background"
      borderRadius="$3"
      padding="$3"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <YStack width="100%" gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontWeight="600" color="$text" fontSize="$4" flex={1}>
            {group.name}
          </Text>
          <XStack backgroundColor={group.visibility === 'OPEN' ? '$green100' : '$gray300'} paddingHorizontal="$2" paddingVertical="$1" borderRadius={6}>
            <Text fontSize="$1" fontWeight="600" color={group.visibility === 'OPEN' ? '#2E7D32' : '#424242'}>
              {group.visibility === 'OPEN' ? 'OPEN' : 'PRIVATE'}
            </Text>
          </XStack>
        </XStack>

        <Text color="$textSecondary" fontSize="$2" numberOfLines={2}>
          {descriptionPreview}
        </Text>

        <Text color="$textSecondary" fontSize="$1">
          {group._count.members} {group._count.members === 1 ? 'member' : 'members'}
        </Text>
      </YStack>
    </Button>
  )
}
