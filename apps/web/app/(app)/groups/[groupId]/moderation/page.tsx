'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Text, Button, Spinner, Input, TextArea } from 'tamagui'
import { trpc } from '@lustre/api'

export default function ModerationPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string
  const [activeTab, setActiveTab] = useState<'pending' | 'members' | 'settings'>('pending')

  const groupQuery = trpc.group.get.useQuery({ groupId })

  if (groupQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!groupQuery.data || !groupQuery.data.isModerator) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">You do not have permission to access this page</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$4">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$text">Moderate: {groupQuery.data.name}</Text>
        </YStack>

        <XStack gap="$2" borderBottomWidth={1} borderBottomColor="$borderColor">
          {(['pending', 'members', 'settings'] as const).map((tab) => (
            <Button
              key={tab}
              backgroundColor={activeTab === tab ? '$primary' : 'transparent'}
              borderRadius="$2"
              paddingHorizontal="$4"
              paddingVertical="$3"
              onPress={() => setActiveTab(tab)}
              borderBottomWidth={activeTab === tab ? 2 : 0}
              borderBottomColor="$primary"
            >
              <Text
                color={activeTab === tab ? 'white' : '$text'}
                fontWeight={activeTab === tab ? '700' : '600'}
                textTransform="capitalize"
              >
                {tab}
              </Text>
            </Button>
          ))}
        </XStack>

        {activeTab === 'pending' && <PendingMembersTab groupId={groupId} groupQuery={groupQuery} />}
        {activeTab === 'members' && <MembersTab groupId={groupId} />}
        {activeTab === 'settings' && <SettingsTab groupId={groupId} group={groupQuery.data} />}
      </YStack>
    </YStack>
  )
}

function PendingMembersTab({ groupId, groupQuery }: {
  groupId: string
  groupQuery: any
}) {
  const pendingQuery = trpc.group.pendingMembers.useQuery({ groupId })
  const approveMutation = trpc.group.approve.useMutation()
  const rejectMutation = trpc.group.reject.useMutation()

  const handleApprove = async (userId: string) => {
    try {
      await approveMutation.mutateAsync({ groupId, userId })
      pendingQuery.refetch()
      groupQuery.refetch()
    } catch (error) {
      console.error('Failed to approve member:', error)
      alert('Failed to approve member')
    }
  }

  const handleReject = async (userId: string) => {
    try {
      await rejectMutation.mutateAsync({ groupId, userId })
      pendingQuery.refetch()
      groupQuery.refetch()
    } catch (error) {
      console.error('Failed to reject member:', error)
      alert('Failed to reject member')
    }
  }

  if (pendingQuery.isLoading) {
    return <Spinner color="$primary" />
  }

  const pending = pendingQuery.data ?? []

  return (
    <YStack gap="$3">
      {pending.length === 0 ? (
        <Text color="$textSecondary">No pending members</Text>
      ) : (
        pending.map((member) => (
          <YStack
            key={member.userId}
            backgroundColor="$background"
            borderRadius="$3"
            padding="$3"
            gap="$2"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$2">
                <YStack
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor="$borderColor"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="$3" fontWeight="600">
                    {(member.user.displayName ?? '?')[0]}
                  </Text>
                </YStack>
                <Text fontWeight="600" color="$text">{member.user.displayName ?? 'Anonymous'}</Text>
              </XStack>
              <XStack gap="$2">
                <Button
                  backgroundColor="$primary"
                  borderRadius="$2"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  onPress={() => handleApprove(member.userId)}
                  disabled={approveMutation.isPending}
                >
                  <Text color="white" fontWeight="600" fontSize="$2">Approve</Text>
                </Button>
                <Button
                  backgroundColor="$borderColor"
                  borderRadius="$2"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  onPress={() => handleReject(member.userId)}
                  disabled={rejectMutation.isPending}
                >
                  <Text color="$text" fontWeight="600" fontSize="$2">Reject</Text>
                </Button>
              </XStack>
            </XStack>
          </YStack>
        ))
      )}
    </YStack>
  )
}

function MembersTab({ groupId }: { groupId: string }) {
  const listQuery = trpc.group.members.useInfiniteQuery(
    { groupId, limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const banMutation = trpc.group.ban.useMutation()

  const members = listQuery.data?.pages.flatMap((page) => page.members) ?? []

  const handleBan = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this member?')) return
    try {
      await banMutation.mutateAsync({ groupId, userId })
      listQuery.refetch()
    } catch (error) {
      console.error('Failed to ban member:', error)
      alert('Failed to ban member')
    }
  }

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage])

  if (listQuery.isLoading) {
    return <Spinner color="$primary" />
  }

  return (
    <YStack gap="$3">
      {members.length === 0 ? (
        <Text color="$textSecondary">No members</Text>
      ) : (
        <>
          {members.map((member) => (
            <YStack
              key={member.userId}
              backgroundColor="$background"
              borderRadius="$3"
              padding="$3"
              gap="$2"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <YStack
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="$borderColor"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="$3" fontWeight="600">
                      {(member.user.displayName ?? '?')[0]}
                    </Text>
                  </YStack>
                  <YStack>
                    <Text fontWeight="600" color="$text">{member.user.displayName ?? 'Anonymous'}</Text>
                    <Text fontSize="$1" color="$textSecondary">Joined {formatDate(member.joinedAt)}</Text>
                  </YStack>
                </XStack>
                <Button
                  backgroundColor="$borderColor"
                  borderRadius="$2"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  onPress={() => handleBan(member.userId)}
                  disabled={banMutation.isPending}
                >
                  <Text color="$text" fontWeight="600" fontSize="$2">Ban</Text>
                </Button>
              </XStack>
            </YStack>
          ))}
          <div ref={loadMoreRef} style={{ height: 1 }} />
          {listQuery.isFetchingNextPage && (
            <YStack padding="$4" alignItems="center">
              <Spinner color="$primary" />
            </YStack>
          )}
        </>
      )}
    </YStack>
  )
}

function SettingsTab({ groupId, group }: {
  groupId: string
  group: any
}) {
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description || '')
  const [category, setCategory] = useState(group.category)
  const [visibility, setVisibility] = useState(group.visibility)

  const updateMutation = trpc.group.update.useMutation()

  const handleSubmit = async () => {
    if (!name.trim() || !category.trim()) {
      alert('Please fill in name and category')
      return
    }

    try {
      await updateMutation.mutateAsync({
        groupId,
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
        visibility: visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      })
      alert('Group updated successfully')
    } catch (error) {
      console.error('Failed to update group:', error)
      alert('Failed to update group')
    }
  }

  return (
    <YStack gap="$4">
      <YStack gap="$2">
        <Text fontWeight="600" color="$text" fontSize="$3">Group Name</Text>
        <Input
          value={name}
          onChangeText={setName}
          fontSize="$3"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$2"
          padding="$3"
          color="$text"
          placeholderTextColor="$textSecondary"
        />
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="600" color="$text" fontSize="$3">Description</Text>
        <TextArea
          value={description}
          onChangeText={(val: string) => setDescription(val)}
          maxLength={1000}
          fontSize="$3"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$2"
          padding="$3"
          color="$text"
          minHeight={100}
          placeholderTextColor="$textSecondary"
        />
        <Text fontSize="$1" color="$textSecondary">{description.length}/1000</Text>
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="600" color="$text" fontSize="$3">Category</Text>
        <Input
          value={category}
          onChangeText={setCategory}
          fontSize="$3"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$2"
          padding="$3"
          color="$text"
          placeholderTextColor="$textSecondary"
        />
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="600" color="$text" fontSize="$3">Visibility</Text>
        <XStack gap="$2">
          <Button
            flex={1}
            backgroundColor={visibility === 'PUBLIC' ? '$primary' : '$borderColor'}
            borderRadius="$3"
            paddingVertical="$3"
            onPress={() => setVisibility('PUBLIC')}
          >
            <Text color={visibility === 'PUBLIC' ? 'white' : '$text'} fontWeight="600">
              OPEN
            </Text>
          </Button>
          <Button
            flex={1}
            backgroundColor={visibility === 'PRIVATE' ? '$primary' : '$borderColor'}
            borderRadius="$3"
            paddingVertical="$3"
            onPress={() => setVisibility('PRIVATE')}
          >
            <Text color={visibility === 'PRIVATE' ? 'white' : '$text'} fontWeight="600">
              PRIVATE
            </Text>
          </Button>
        </XStack>
      </YStack>

      <Button
        backgroundColor="$primary"
        borderRadius="$3"
        paddingVertical="$4"
        onPress={handleSubmit}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? (
          <Spinner color="white" size="small" />
        ) : (
          <Text color="white" fontWeight="600" fontSize="$4">Save Changes</Text>
        )}
      </Button>
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
