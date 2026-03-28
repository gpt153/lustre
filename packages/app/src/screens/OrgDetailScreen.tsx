import { ScrollView, YStack, XStack, Text, Button, H2, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'

interface OrgDetailScreenProps {
  orgId: string
  onAdminPress?: () => void
}

export function OrgDetailScreen({ orgId, onAdminPress }: OrgDetailScreenProps) {
  const orgQuery = trpc.org.get.useQuery({ orgId })
  const joinMutation = trpc.org.join.useMutation()
  const leaveMutation = trpc.org.leave.useMutation()

  if (orgQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!orgQuery.data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$textSecondary">Organization not found</Text>
      </YStack>
    )
  }

  const org = orgQuery.data

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ orgId })
      orgQuery.refetch()
    } catch (error) {
      console.error('Error joining org:', error)
    }
  }

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync({ orgId })
      orgQuery.refetch()
    } catch (error) {
      console.error('Error leaving org:', error)
    }
  }

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$md" gap="$md">
        <YStack gap="$xs">
          <XStack justifyContent="space-between" alignItems="flex-start" gap="$xs">
            <YStack flex={1}>
              <H2 color="$text">{org.name}</H2>
              <XStack gap="$xs" alignItems="center" marginTop="$2">
                <XStack backgroundColor="$blue100" paddingHorizontal="$xs" paddingVertical="$xs" borderRadius={6}>
                  <Text fontSize="$1" fontWeight="600" color="$primary">
                    {org.type}
                  </Text>
                </XStack>
                <Text color="$textSecondary" fontSize="$2">
                  {org._count.members} {org._count.members === 1 ? 'member' : 'members'}
                </Text>
                {org.verified && (
                  <Text color="#D4A843" fontSize="$2" fontWeight="600">
                    ✓ Verified
                  </Text>
                )}
              </XStack>
            </YStack>
          </XStack>
        </YStack>

        {org.description && (
          <YStack gap="$xs">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">
              About
            </Text>
            <Text color="$text" fontSize="$3">
              {org.description}
            </Text>
          </YStack>
        )}

        {org.locationName && (
          <YStack gap="$xs">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">
              Location
            </Text>
            <Text color="$text" fontSize="$3">
              {org.locationName}
            </Text>
          </YStack>
        )}

        {org.contactEmail && (
          <YStack gap="$xs">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">
              Contact
            </Text>
            <Text color="$text" fontSize="$3">
              {org.contactEmail}
            </Text>
          </YStack>
        )}

        <YStack gap="$xs">
          {!org.isMember ? (
            <Button
              size="$3"
              backgroundColor="$primary"
              color="white"
              onPress={handleJoin}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? 'Joining...' : 'Join Organization'}
            </Button>
          ) : (
            <Button
              size="$3"
              backgroundColor="$gray300"
              color="$text"
              onPress={handleLeave}
              disabled={leaveMutation.isPending}
            >
              {leaveMutation.isPending ? 'Leaving...' : 'Leave Organization'}
            </Button>
          )}

          {(org.memberRole === 'OWNER' || org.memberRole === 'ADMIN') && onAdminPress && (
            <Button
              size="$3"
              backgroundColor="$orange400"
              color="white"
              onPress={onAdminPress}
            >
              Admin Panel
            </Button>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
