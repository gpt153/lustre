'use client'

import { useParams } from 'next/navigation'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function OrgDetailPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const orgQuery = trpc.org.get.useQuery({ orgId })
  const joinMutation = trpc.org.join.useMutation()
  const leaveMutation = trpc.org.leave.useMutation()

  if (orgQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!orgQuery.data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">Organization not found</Text>
      </YStack>
    )
  }

  const org = orgQuery.data
  const isMember = org.isMember
  const canAdmin = org.memberRole === 'OWNER' || org.memberRole === 'ADMIN'

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ orgId })
      orgQuery.refetch()
    } catch (error) {
      console.error('Failed to join organization:', error)
      alert('Failed to join organization')
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this organization?')) return
    try {
      await leaveMutation.mutateAsync({ orgId })
      orgQuery.refetch()
    } catch (error) {
      console.error('Failed to leave organization:', error)
      alert('Failed to leave organization')
    }
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$4">
        <YStack backgroundColor="$background" borderRadius="$3" padding="$4" gap="$3" borderWidth={1} borderColor="$borderColor">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} gap="$2">
              <XStack gap="$2" alignItems="center">
                <Text fontSize="$6" fontWeight="700" color="$text">{org.name}</Text>
                {org.verified && (
                  <YStack
                    backgroundColor="$primary"
                    borderRadius="$2"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    <Text fontSize="$1" fontWeight="600" color="white">VERIFIED</Text>
                  </YStack>
                )}
              </XStack>
              {org.description && (
                <Text color="$text" fontSize="$3">{org.description}</Text>
              )}
              <XStack gap="$4">
                <Text fontSize="$2" color="$textSecondary">
                  {org._count.members} {org._count.members === 1 ? 'member' : 'members'}
                </Text>
                {org.locationName && (
                  <Text fontSize="$2" color="$textSecondary">{org.locationName}</Text>
                )}
              </XStack>
              {org.contactEmail && (
                <Text fontSize="$2" color="$textSecondary">{org.contactEmail}</Text>
              )}
            </YStack>
            <YStack
              backgroundColor="$borderColor"
              borderRadius="$2"
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              <Text
                fontSize="$2"
                fontWeight="600"
                color="$text"
              >
                {org.type}
              </Text>
            </YStack>
          </XStack>

          <XStack gap="$2">
            {!isMember ? (
              <Button
                backgroundColor="$primary"
                borderRadius="$3"
                paddingHorizontal="$4"
                paddingVertical="$2"
                onPress={handleJoin}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? (
                  <Spinner color="white" size="small" />
                ) : (
                  <Text color="white" fontWeight="600">Join Organization</Text>
                )}
              </Button>
            ) : (
              <>
                <Button
                  backgroundColor="$borderColor"
                  borderRadius="$3"
                  paddingHorizontal="$4"
                  paddingVertical="$2"
                  onPress={handleLeave}
                  disabled={leaveMutation.isPending}
                >
                  {leaveMutation.isPending ? (
                    <Spinner color="$text" size="small" />
                  ) : (
                    <Text color="$text" fontWeight="600">Leave Organization</Text>
                  )}
                </Button>
                {canAdmin && (
                  <Link href={`/orgs/${orgId}/admin`} style={{ textDecoration: 'none' }}>
                    <Button backgroundColor="$primary" borderRadius="$3" paddingHorizontal="$4" paddingVertical="$2">
                      <Text color="white" fontWeight="600">Admin</Text>
                    </Button>
                  </Link>
                )}
              </>
            )}
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  )
}
