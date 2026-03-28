import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { PostCard } from '../components/PostCard'
import { FeedAdCard } from '../components/FeedAdCard'
import { useFeed } from '../hooks/useFeed'

const COPPER = '#894d0d'
const COPPER_DARK = '#a76526'
const GOLD = '#D4A843'
const WARM_WHITE = '#fef8f3'
const CHARCOAL = '#2C2421'
const WARM_GRAY = '#8B7E74'
const SURFACE_CONTAINER = '#f2ede8'

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

const TABS = ['Alla', 'Följer', 'Populärt'] as const
type FeedTab = (typeof TABS)[number]

export function FeedScreen({ onCreatePost }: { onCreatePost?: () => void }) {
  const feed = useFeed()
  const recordImpression = trpc.ad.recordImpression.useMutation()
  const recordClick = trpc.ad.recordClick.useMutation()
  const [activeTab, setActiveTab] = useState<FeedTab>('Alla')

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
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={WARM_WHITE}>
        <Spinner color={COPPER} />
      </YStack>
    )
  }

  const items = feed.posts as unknown as FeedItem[]

  return (
    <YStack flex={1} backgroundColor={SURFACE_CONTAINER}>
      {/* Header */}
      <YStack paddingTop={8} paddingHorizontal={20} paddingBottom={12}>
        <Text
          fontSize={28}
          fontWeight="700"
          fontFamily="$heading"
          color={CHARCOAL}
        >
          Flöde
        </Text>

        {/* Tab pills */}
        <XStack gap={10} marginTop={12}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <YStack
                paddingHorizontal={20}
                paddingVertical={10}
                borderRadius={999}
                backgroundColor={activeTab === tab ? COPPER : 'rgba(29, 27, 25, 0.04)'}
              >
                <Text
                  fontSize={14}
                  fontWeight={activeTab === tab ? '600' : '500'}
                  color={activeTab === tab ? 'white' : WARM_GRAY}
                >
                  {tab}
                </Text>
              </YStack>
            </TouchableOpacity>
          ))}
        </XStack>
      </YStack>

      {/* Feed list */}
      <FlatList
        data={items}
        keyExtractor={(item: FeedItem) =>
          item.type === 'ad' ? `ad-${item.campaignId}-${item.creativeId}` : item.id
        }
        contentContainerStyle={styles.feedList}
        renderItem={({ item }: { item: FeedItem }) => (
          <YStack marginBottom={16}>
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
            tintColor={COPPER}
            colors={[COPPER]}
          />
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <YStack padding={24} alignItems="center">
              <Spinner color={COPPER} />
            </YStack>
          ) : null
        }
        ListEmptyComponent={
          <YStack flex={1} alignItems="center" justifyContent="center" padding={48}>
            <Text fontSize={48} marginBottom={16}>✨</Text>
            <Text
              fontSize={20}
              fontWeight="600"
              color={CHARCOAL}
              textAlign="center"
              marginBottom={8}
              fontFamily="$heading"
            >
              Inga inlägg ännu
            </Text>
            <Text
              fontSize={15}
              color={WARM_GRAY}
              textAlign="center"
              lineHeight={22}
            >
              Var den första att dela något med communityt!
            </Text>
          </YStack>
        }
      />

      {/* FAB — Create post */}
      {onCreatePost && (
        <TouchableOpacity
          onPress={onCreatePost}
          style={styles.fab}
          activeOpacity={0.85}
        >
          <YStack
            width={60}
            height={60}
            borderRadius={9999}
            backgroundColor={COPPER}
            alignItems="center"
            justifyContent="center"
            shadowColor="#2C2421"
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.06}
            shadowRadius={24}
            elevationAndroid={8}
          >
            <Text fontSize={28} color="white" fontWeight="300">+</Text>
          </YStack>
        </TouchableOpacity>
      )}
    </YStack>
  )
}

const styles = StyleSheet.create({
  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
})
