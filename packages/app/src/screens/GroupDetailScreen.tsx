import { ScrollView, YStack, XStack, Text, Button, H2, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'

interface GroupDetailScreenProps {
  groupId: string
  onModerationPress?: () => void
}

export function GroupDetailScreen({ groupId, onModerationPress }: GroupDetailScreenProps) {
  const groupQuery = trpc.group.get.useQuery({ groupId })

  if (groupQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!groupQuery.data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$textSecondary">Group not found</Text>
      </YStack>
    )
  }

  const group = groupQuery.data

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$md" gap="$md">
        <YStack gap="$xs">
          <XStack justifyContent="space-between" alignItems="flex-start" gap="$xs">
            <YStack flex={1}>
              <H2 color="$text">{group.name}</H2>
              <XStack gap="$xs" alignItems="center" marginTop="$2">
                <XStack backgroundColor={group.visibility === 'OPEN' ? '$green100' : '$gray300'} paddingHorizontal="$xs" paddingVertical="$xs" borderRadius={6}>
                  <Text fontSize="$1" fontWeight="600" color={group.visibility === 'OPEN' ? '#2E7D32' : '#424242'}>
                    {group.visibility === 'OPEN' ? 'OPEN' : 'PRIVATE'}
                  </Text>
                </XStack>
                <Text color="$textSecondary" fontSize="$2">
                  {group._count.members} {group._count.members === 1 ? 'member' : 'members'}
                </Text>
              </XStack>
            </YStack>
          </XStack>
        </YStack>

        {group.description && (
          <YStack gap="$xs">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">
              About
            </Text>
            <Text color="$text" fontSize="$3">
              {group.description}
            </Text>
          </YStack>
        )}

        <YStack gap="$xs">
          {!group.isMember ? (
            <Button
              size="$3"
              backgroundColor="$primary"
              color="white"
              onPress={async () => {
                await trpc.group.join.useMutation().mutateAsync({ groupId })
                groupQuery.refetch()
              }}
            >
              Join Group
            </Button>
          ) : (
            <Button
              size="$3"
              backgroundColor="$gray300"
              color="$text"
              onPress={async () => {
                await trpc.group.leave.useMutation().mutateAsync({ groupId })
                groupQuery.refetch()
              }}
            >
              Leave Group
            </Button>
          )}

          {group.isModerator && onModerationPress && (
            <Button
              size="$3"
              backgroundColor="$orange400"
              color="white"
              onPress={onModerationPress}
            >
              Moderation
            </Button>
          )}
        </YStack>

        <YStack gap="$xs" borderTopWidth={1} borderTopColor="$borderColor" paddingTopHorizontal="$4">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Members
          </Text>
          <Text color="$textSecondary" fontSize="$2">
            This feature is coming soon
          </Text>
        </YStack>

        <YStack gap="$xs" borderTopWidth={1} borderTopColor="$borderColor" paddingTopHorizontal="$4">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Group Feed
          </Text>
          <Text color="$textSecondary" fontSize="$2">
            This feature is coming soon
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
