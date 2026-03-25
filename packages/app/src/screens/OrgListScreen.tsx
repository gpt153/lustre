import { useCallback, useState } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Input, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import { OrgCard } from '../components/OrgCard'

interface OrgListScreenProps {
  onOrgPress: (orgId: string) => void
  onCreatePress: () => void
}

export function OrgListScreen({ onOrgPress, onCreatePress }: OrgListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const orgsQuery = trpc.org.list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const searchResults = trpc.org.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  )

  const displayOrgs = searchQuery.length > 0 ? searchResults.data ?? [] : orgsQuery.data?.pages.flatMap((page) => page.orgs) ?? []
  const isLoading = searchQuery.length > 0 ? searchResults.isLoading : orgsQuery.isLoading

  const handleEndReached = useCallback(() => {
    if (!searchQuery && orgsQuery.hasNextPage && !orgsQuery.isFetchingNextPage) {
      orgsQuery.fetchNextPage()
    }
  }, [searchQuery, orgsQuery.hasNextPage, orgsQuery.isFetchingNextPage, orgsQuery.fetchNextPage])

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack paddingHorizontal="$3" paddingVertical="$2" gap="$2">
        <XStack gap="$2" alignItems="center">
          <Input
            flex={1}
            placeholder="Search organizations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            size="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$3"
            paddingHorizontal="$3"
          />
          <Button size="$3" backgroundColor="$primary" color="white" onPress={onCreatePress}>
            +
          </Button>
        </XStack>
      </YStack>

      <FlatList
        data={displayOrgs}
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={({ item }: { item: typeof displayOrgs[number] }) => (
          <YStack paddingHorizontal="$3" paddingVertical="$2">
            <OrgCard
              org={item}
              onPress={onOrgPress}
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
                orgsQuery.refetch()
              } else {
                searchResults.refetch()
              }
            }}
          />
        }
        ListFooterComponent={
          (searchQuery ? searchResults.isLoading : orgsQuery.isFetchingNextPage) ? (
            <YStack padding="$4" alignItems="center">
              <Spinner color="$primary" />
            </YStack>
          ) : null
        }
        ListEmptyComponent={
          <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
            <Text color="$textSecondary">
              {searchQuery ? 'No organizations found' : 'No organizations yet. Create one!'}
            </Text>
          </YStack>
        }
      />
    </YStack>
  )
}
