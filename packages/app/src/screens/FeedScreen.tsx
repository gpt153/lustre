import { useCallback } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { YStack, Text, Spinner } from 'tamagui'
import { PostCard } from '../components/PostCard'
import { useFeed } from '../hooks/useFeed'

export function FeedScreen() {
  const feed = useFeed()

  const handleEndReached = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) {
      feed.fetchNextPage()
    }
  }, [feed.hasNextPage, feed.isFetchingNextPage, feed.fetchNextPage])

  if (feed.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <FlatList
      data={feed.posts}
      keyExtractor={(item: { id: string }) => item.id}
      renderItem={({ item }: { item: typeof feed.posts[number] }) => (
        <YStack paddingHorizontal="$3" paddingVertical="$2">
          <PostCard
            post={item}
            onLike={feed.like}
            onUnlike={feed.unlike}
            onShowLess={feed.showLess}
          />
        </YStack>
      )}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => feed.refetch()}
        />
      }
      ListFooterComponent={
        feed.isFetchingNextPage ? (
          <YStack padding="$4" alignItems="center">
            <Spinner color="$primary" />
          </YStack>
        ) : null
      }
      ListEmptyComponent={
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
          <Text color="$textSecondary">No posts yet. Be the first!</Text>
        </YStack>
      }
    />
  )
}
