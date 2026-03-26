import { useCallback, useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Spinner, Input, TextArea } from 'tamagui'
import { FlatList, RefreshControl } from 'react-native'
import { trpc } from '@lustre/api'

interface GroupModerationScreenProps {
  groupId: string
}

type Tab = 'pending' | 'members' | 'settings'

export function GroupModerationScreen({ groupId }: GroupModerationScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupCategory, setGroupCategory] = useState('')
  const [groupVisibility, setGroupVisibility] = useState<'OPEN' | 'PRIVATE'>('OPEN')
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const pendingQuery = trpc.group.pendingMembers.useQuery({ groupId })
  const membersQuery = trpc.group.members.useInfiniteQuery(
    { groupId, limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )
  const groupQuery = trpc.group.get.useQuery({ groupId })

  const approveMutation = trpc.group.approve.useMutation()
  const rejectMutation = trpc.group.reject.useMutation()
  const banMutation = trpc.group.ban.useMutation()
  const updateMutation = trpc.group.update.useMutation()

  const members = membersQuery.data?.pages.flatMap((page) => page.members) ?? []

  const handleApprove = async (userId: string) => {
    await approveMutation.mutateAsync({ groupId, userId })
    pendingQuery.refetch()
    membersQuery.refetch()
  }

  const handleReject = async (userId: string) => {
    await rejectMutation.mutateAsync({ groupId, userId })
    pendingQuery.refetch()
  }

  const handleBan = async (userId: string) => {
    await banMutation.mutateAsync({ groupId, userId })
    membersQuery.refetch()
  }

  const handleUpdateSettings = async () => {
    await updateMutation.mutateAsync({
      groupId,
      name: groupName || undefined,
      description: groupDescription || undefined,
      category: groupCategory || undefined,
      visibility: groupVisibility,
    })
    groupQuery.refetch()
  }

  const handleLoadSettings = () => {
    if (groupQuery.data && !settingsLoaded) {
      setGroupName(groupQuery.data.name)
      setGroupDescription(groupQuery.data.description || '')
      setGroupCategory(groupQuery.data.category)
      setGroupVisibility(groupQuery.data.visibility as 'OPEN' | 'PRIVATE')
      setSettingsLoaded(true)
    }
  }

  const handleEndReached = useCallback(() => {
    if (membersQuery.hasNextPage && !membersQuery.isFetchingNextPage) {
      membersQuery.fetchNextPage()
    }
  }, [membersQuery.hasNextPage, membersQuery.isFetchingNextPage, membersQuery.fetchNextPage])

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        paddingHorizontal="$3"
        gap="$2"
      >
        <Button
          chromeless
          onPress={() => setActiveTab('pending')}
          borderBottomWidth={activeTab === 'pending' ? 2 : 0}
          borderBottomColor="$primary"
          paddingBottom="$3"
          marginBottom="$-3"
        >
          <Text color={activeTab === 'pending' ? '$primary' : '$textSecondary'} fontWeight="600">
            Pending
          </Text>
        </Button>
        <Button
          chromeless
          onPress={() => setActiveTab('members')}
          borderBottomWidth={activeTab === 'members' ? 2 : 0}
          borderBottomColor="$primary"
          paddingBottom="$3"
          marginBottom="$-3"
        >
          <Text color={activeTab === 'members' ? '$primary' : '$textSecondary'} fontWeight="600">
            Members
          </Text>
        </Button>
        <Button
          chromeless
          onPress={() => {
            setActiveTab('settings')
            handleLoadSettings()
          }}
          borderBottomWidth={activeTab === 'settings' ? 2 : 0}
          borderBottomColor="$primary"
          paddingBottom="$3"
          marginBottom="$-3"
        >
          <Text color={activeTab === 'settings' ? '$primary' : '$textSecondary'} fontWeight="600">
            Settings
          </Text>
        </Button>
      </XStack>

      {activeTab === 'pending' && (
        <FlatList
          data={pendingQuery.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <YStack paddingHorizontal="$3" paddingVertical="$2" borderBottomWidth={1} borderBottomColor="$borderColor" gap="$2">
              <Text fontWeight="600" color="$text">
                {item.user.displayName}
              </Text>
              <XStack gap="$2">
                <Button
                  size="$2"
                  flex={1}
                  backgroundColor="$primary"
                  color="white"
                  onPress={() => handleApprove(item.userId)}
                >
                  Approve
                </Button>
                <Button
                  size="$2"
                  flex={1}
                  backgroundColor="$red400"
                  color="white"
                  onPress={() => handleReject(item.userId)}
                >
                  Reject
                </Button>
              </XStack>
            </YStack>
          )}
          ListEmptyComponent={
            <YStack padding="$6" alignItems="center">
              <Text color="$textSecondary">No pending members</Text>
            </YStack>
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => pendingQuery.refetch()}
            />
          }
        />
      )}

      {activeTab === 'members' && (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <YStack paddingHorizontal="$3" paddingVertical="$2" borderBottomWidth={1} borderBottomColor="$borderColor" gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <YStack flex={1}>
                  <Text fontWeight="600" color="$text">
                    {item.user.displayName}
                  </Text>
                  <Text color="$textSecondary" fontSize="$2">
                    Joined {new Date(item.joinedAt).toLocaleDateString()}
                  </Text>
                </YStack>
                <Button
                  size="$2"
                  backgroundColor="$red400"
                  color="white"
                  onPress={() => handleBan(item.userId)}
                >
                  Ban
                </Button>
              </XStack>
            </YStack>
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            membersQuery.isFetchingNextPage ? (
              <YStack padding="$4" alignItems="center">
                <Spinner color="$primary" />
              </YStack>
            ) : null
          }
          ListEmptyComponent={
            <YStack padding="$6" alignItems="center">
              <Text color="$textSecondary">No members yet</Text>
            </YStack>
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => membersQuery.refetch()}
            />
          }
        />
      )}

      {activeTab === 'settings' && (
        <ScrollView flex={1}>
          <YStack padding="$4" gap="$4">
            <YStack gap="$2">
              <Text color="$textSecondary" fontSize="$2" fontWeight="600">
                Name
              </Text>
              <Input
                value={groupName}
                onChangeText={setGroupName}
                size="$3"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$3"
                paddingHorizontal="$3"
              />
            </YStack>

            <YStack gap="$2">
              <Text color="$textSecondary" fontSize="$2" fontWeight="600">
                Description
              </Text>
              <TextArea
                value={groupDescription}
                onChangeText={setGroupDescription}
                size="$3"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$3"
                paddingHorizontal="$3"
                minHeight={100}
              />
            </YStack>

            <YStack gap="$2">
              <Text color="$textSecondary" fontSize="$2" fontWeight="600">
                Category
              </Text>
              <Input
                value={groupCategory}
                onChangeText={setGroupCategory}
                size="$3"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$3"
                paddingHorizontal="$3"
              />
            </YStack>

            <YStack gap="$2">
              <Text color="$textSecondary" fontSize="$2" fontWeight="600">
                Visibility
              </Text>
              <YStack gap="$2">
                <Button
                  size="$3"
                  backgroundColor={groupVisibility === 'OPEN' ? '$primary' : '$gray300'}
                  color={groupVisibility === 'OPEN' ? 'white' : '$text'}
                  onPress={() => setGroupVisibility('OPEN')}
                >
                  Open
                </Button>
                <Button
                  size="$3"
                  backgroundColor={groupVisibility === 'PRIVATE' ? '$primary' : '$gray300'}
                  color={groupVisibility === 'PRIVATE' ? 'white' : '$text'}
                  onPress={() => setGroupVisibility('PRIVATE')}
                >
                  Private
                </Button>
              </YStack>
            </YStack>

            <Button
              size="$4"
              backgroundColor="$primary"
              color="white"
              onPress={handleUpdateSettings}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Spinner color="white" size="small" /> : 'Save Changes'}
            </Button>
          </YStack>
        </ScrollView>
      )}
    </YStack>
  )
}
