import { useCallback } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { YStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { PostCard } from '../components/PostCard'
import { FeedAdCard } from '../components/FeedAdCard'
import { useFeed } from '../hooks/useFeed'

type FeedPost = {
  type: 'post'
  id: string
  text: string | null
  createdAt: Date
  author: { id: string; displayName: string | null; avatarUrl: string | null }
  media: Array<{ id: string; url: string; thumbnailMedium: string | null }>
  likeCount: number
  isLiked: boolean
}

type FeedAd = {
  type: 'ad'
  campaignId: string
  creativeId: string
  headline: string
  body: string | null
  imageUrl: string | null
  ctaUrl: string
  sponsor: string | null
}

type FeedItem = FeedPost | FeedAd

export function FeedScreen() {
  const feed = useFeed()
  const recordImpression = trpc.ad.recordImpression.useMutation()
  const recordClick = trpc.ad.recordClick.useMutation()

  const handleEndReached = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) {
      feed.fetchNextPage()
    }
  }, [feed.hasNextPage, feed.isFetchingNextPage, feed.fetchNextPage])

  const handleImpression = useCallback(
    (campaignId: string, creativeId: string) => {
      recordImpression.mutate({ campaignId, creativeId })
    },
    [recordImpression]
  )

  const handleClick = useCallback(
    (campaignId: string, creativeId: string) => {
      recordClick.mutate({ campaignId, creativeId })
    },
    [recordClick]
  )

  if (feed.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const items = feed.posts as unknown as FeedItem[]

  return (
    <FlatList
      data={items}
      keyExtractor={(item: FeedItem) =>
        item.type === 'ad' ? `ad-${item.campaignId}-${item.creativeId}` : item.id
      }
      renderItem={({ item }: { item: FeedItem }) => (
        <YStack paddingHorizontal="$3" paddingVertical="$2">
          {item.type === 'ad' ? (
            <FeedAdCard
              campaignId={item.campaignId}
              creativeId={item.creativeId}
              headline={item.headline}
              body={item.body}
              imageUrl={item.imageUrl}
              ctaUrl={item.ctaUrl}
              sponsor={item.sponsor}
              onImpression={() => handleImpression(item.campaignId, item.creativeId)}
              onClick={() => handleClick(item.campaignId, item.creativeId)}
            />
          ) : (
            <PostCard
              post={item}
              onLike={feed.like}
              onUnlike={feed.unlike}
              onShowLess={feed.showLess}
            />
          )}
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
