import { ScrollView, YStack, Text, Button, Spinner, XStack } from 'tamagui'
import { FlatList } from 'react-native'
import { trpc } from '@lustre/api'

interface OrgAdminScreenProps {
  orgId: string
}

export function OrgAdminScreen({ orgId }: OrgAdminScreenProps) {
  const membersQuery = trpc.org.getMembers.useQuery({ orgId })
  const verificationMutation = trpc.org.requestVerification.useMutation()

  if (membersQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const members = membersQuery.data ?? []

  const handleRequestVerification = async () => {
    try {
      await verificationMutation.mutateAsync({ orgId })
    } catch (error) {
      console.error('Error requesting verification:', error)
    }
  }

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$4" gap="$4">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="600" color="$text">
            Admin Panel
          </Text>
        </YStack>

        <YStack gap="$2">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Request Verification
          </Text>
          <Button
            size="$3"
            backgroundColor="$blue400"
            color="white"
            onPress={handleRequestVerification}
            disabled={verificationMutation.isPending}
          >
            {verificationMutation.isPending ? 'Requesting...' : 'Request Verification'}
          </Button>
        </YStack>

        <YStack gap="$2" borderTopWidth={1} borderTopColor="$borderColor" paddingTopHorizontal="$4">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Members ({members.length})
          </Text>
        </YStack>

        <FlatList
          scrollEnabled={false}
          data={members}
          keyExtractor={(item: { id: string }) => item.id}
          renderItem={({ item }: { item: typeof members[number] }) => (
            <YStack
              paddingVertical="$2"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
              gap="$1"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$text" fontSize="$3" fontWeight="600">
                  {item.user?.displayName || 'User'}
                </Text>
                <XStack
                  backgroundColor={
                    item.role === 'OWNER'
                      ? '$orange100'
                      : item.role === 'ADMIN'
                        ? '$blue100'
                        : '$gray200'
                  }
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius={6}
                >
                  <Text
                    fontSize="$1"
                    fontWeight="600"
                    color={
                      item.role === 'OWNER'
                        ? '#F57C00'
                        : item.role === 'ADMIN'
                          ? '#1976D2'
                          : '#424242'
                    }
                  >
                    {item.role}
                  </Text>
                </XStack>
              </XStack>
              <Text color="$textSecondary" fontSize="$2">
                {item.user?.email}
              </Text>
            </YStack>
          )}
        />
      </YStack>
    </ScrollView>
  )
}
