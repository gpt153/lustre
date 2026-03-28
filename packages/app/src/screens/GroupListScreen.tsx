import { useCallback, useState } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Input, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import { GroupCard } from '../components/GroupCard'
import { useGroups } from '../hooks/useGroups'

interface GroupListScreenProps {
  onGroupPress: (groupId: string) => void
  onCreatePress: () => void
}

export function GroupListScreen({ onGroupPress, onCreatePress }: GroupListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const groups = useGroups()

  const searchResults = trpc.group.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  )

  const displayGroups = searchQuery.length > 0 ? searchResults.data ?? [] : groups.groups
  const isLoading = searchQuery.length > 0 ? searchResults.isLoading : groups.isLoading

  const handleEndReached = useCallback(() => {
    if (!searchQuery && groups.hasNextPage && !groups.isFetchingNextPage) {
      groups.fetchNextPage()
    }
  }, [searchQuery, groups.hasNextPage, groups.isFetchingNextPage, groups.fetchNextPage])

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack paddingHorizontal="$sm" paddingVertical="$xs" gap="$xs">
        <XStack gap="$xs" alignItems="center">
          <Input
            flex={1}
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            size="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$3"
            paddingHorizontal="$sm"
          />
          <Button size="$3" backgroundColor="$primary" color="white" onPress={onCreatePress}>
            +
          </Button>
        </XStack>
      </YStack>

      <FlatList
        data={displayGroups}
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={({ item }: { item: typeof displayGroups[number] }) => (
          <YStack paddingHorizontal="$sm" paddingVertical="$xs">
            <GroupCard
              group={item}
              onPress={onGroupPress}
            />
          </YStack>
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              if (!searchQuery) {
                groups.refetch()
              } else {
                searchResults.refetch()
              }
            }}
            tintColor="#B87333"
            colors={['#B87333']}
          />
        }
        ListFooterComponent={
          (searchQuery ? searchResults.isLoading : groups.isFetchingNextPage) ? (
            <YStack padding="$md" alignItems="center">
              <Spinner color="$primary" />
            </YStack>
          ) : null
        }
        ListEmptyComponent={
          <YStack flex={1} alignItems="center" justifyContent="center" padding="$lg">
            <Text color="$textSecondary">
              {searchQuery ? 'No groups found' : 'No groups yet. Create one!'}
            </Text>
          </YStack>
        }
      />
    </YStack>
  )
}
