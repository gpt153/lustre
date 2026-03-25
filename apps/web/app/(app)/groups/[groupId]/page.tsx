'use client'

import { useParams } from 'next/navigation'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const groupQuery = trpc.group.get.useQuery({ groupId })
  const membersQuery = trpc.group.members.useQuery({ groupId, limit: 10 })
  const joinMutation = trpc.group.join.useMutation()
  const leaveMutation = trpc.group.leave.useMutation()

  if (groupQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!groupQuery.data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">Group not found</Text>
      </YStack>
    )
  }

  const group = groupQuery.data
  const isMember = group.isMember
  const isModerator = group.isModerator

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ groupId })
      groupQuery.refetch()
    } catch (error) {
      console.error('Failed to join group:', error)
      alert('Failed to join group')
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return
    try {
      await leaveMutation.mutateAsync({ groupId })
      groupQuery.refetch()
    } catch (error) {
      console.error('Failed to leave group:', error)
      alert('Failed to leave group')
    }
  }

  const members = membersQuery.data?.members ?? []

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$4">
        <YStack backgroundColor="$background" borderRadius="$3" padding="$4" gap="$3" borderWidth={1} borderColor="$borderColor">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} gap="$2">
              <Text fontSize="$6" fontWeight="700" color="$text">{group.name}</Text>
              {group.description && (
                <Text color="$text" fontSize="$3">{group.description}</Text>
              )}
              <XStack gap="$4">
                <Text fontSize="$2" color="$textSecondary">
                  {group._count.members} {group._count.members === 1 ? 'member' : 'members'}
                </Text>
                <Text fontSize="$2" color="$textSecondary">{group.category}</Text>
              </XStack>
            </YStack>
            <YStack
              backgroundColor={group.visibility === 'PUBLIC' ? '$primary' : '$borderColor'}
              borderRadius="$2"
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              <Text
                fontSize="$2"
                fontWeight="600"
                color={group.visibility === 'PUBLIC' ? 'white' : '$text'}
              >
                {group.visibility === 'PUBLIC' ? 'OPEN' : 'PRIVATE'}
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
                  <Text color="white" fontWeight="600">Join Group</Text>
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
                    <Text color="$text" fontWeight="600">Leave Group</Text>
                  )}
                </Button>
                {isModerator && (
                  <Link href={`/groups/${groupId}/moderation`} style={{ textDecoration: 'none' }}>
                    <Button backgroundColor="$primary" borderRadius="$3" paddingHorizontal="$4" paddingVertical="$2">
                      <Text color="white" fontWeight="600">Moderate</Text>
                    </Button>
                  </Link>
                )}
              </>
            )}
          </XStack>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="700" color="$text">Members</Text>
          {members.length === 0 ? (
            <Text color="$textSecondary">No members yet</Text>
          ) : (
            <YStack gap="$2" borderWidth={1} borderColor="$borderColor" borderRadius="$3" padding="$3">
              {members.map((member) => (
                <XStack key={member.userId} alignItems="center" gap="$2" paddingVertical="$2">
                  <YStack
                    width={36}
                    height={36}
                    borderRadius={18}
                    backgroundColor="$borderColor"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="$3" fontWeight="600">
                      {(member.user.displayName ?? '?')[0]}
                    </Text>
                  </YStack>
                  <YStack flex={1}>
                    <Text fontWeight="600" color="$text">{member.user.displayName ?? 'Anonymous'}</Text>
                    <Text fontSize="$1" color="$textSecondary">Joined {formatDate(member.joinedAt)}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}m ago`
  return d.toLocaleDateString()
}
