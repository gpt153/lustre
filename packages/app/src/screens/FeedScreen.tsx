import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, StyleSheet, View, Text as RNText, Animated } from 'react-native'
import { YStack, Spinner } from 'tamagui'
import { useRouter } from 'expo-router'
import { trpc } from '@lustre/api'
import { PostCard } from '../components/PostCard'
import { PolaroidFeedCard } from '../components/PolaroidFeedCard'
import { FeedAdCard } from '../components/FeedAdCard'
import { useFeed } from '../hooks/useFeed'
import { EmptyState } from '../components/EmptyState'

const COPPER = '#B87333'
const COPPER_DARK = '#894d0d'
const WARM_CREAM = '#FDF8F3'
const CHARCOAL = '#2C2421'
const WARM_GRAY = '#8B7E74'

/**
 * ScaleButton — a lightweight pressable that adds scale-down feedback.
 * Uses Animated.Value for a spring-based press animation (scale to 0.95).
 */
function ScaleButton({
  onPress,
  style,
  children,
  scaleTo = 0.95,
  hitSlop,
}: {
  onPress?: () => void
  style?: any
  children: React.ReactNode
  scaleTo?: number
  hitSlop?: number
}) {
  const scaleAnim = useState(() => new Animated.Value(1))[0]

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start()
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      hitSlop={hitSlop}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  )
}

// Scattered rotations matching Stitch design
const ROTATIONS = [-3, 2, -1, 4]

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

function StickyNote() {
  return (
    <View style={styles.stickyNote}>
      {/* Push-pin — centered via wrapper */}
      <View style={styles.pushPinWrapper}>
        <View style={styles.pushPin}>
          <View style={styles.pushPinInner} />
        </View>
      </View>
      <RNText style={styles.stickyNoteText}>
        Välkommen till flödet! Dela ögonblick, upptäck nya människor och sprid värme.
      </RNText>
    </View>
  )
}

export function FeedScreen({ onCreatePost }: { onCreatePost?: () => void }) {
  const router = useRouter()
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
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={WARM_CREAM}>
        <Spinner color={COPPER_DARK} />
      </YStack>
    )
  }

  const items = feed.posts as unknown as FeedItem[]

  const renderItem = ({ item, index }: { item: FeedItem; index: number }) => {
    if (item.type === 'ad') {
      return (
        <View style={styles.itemSpacing}>
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
        </View>
      )
    }

    // Posts with media get Polaroid treatment
    const hasMedia = item.media && item.media.length > 0
    if (hasMedia) {
      const rotation = ROTATIONS[index % ROTATIONS.length]
      return (
        <View style={styles.itemSpacing}>
          <PolaroidFeedCard
            post={item}
            rotation={rotation}
            onLike={feed.like}
            onUnlike={feed.unlike}
          />
        </View>
      )
    }

    // Text-only posts keep the existing PostCard
    return (
      <View style={styles.itemSpacing}>
        <PostCard
          post={item}
          onLike={feed.like}
          onUnlike={feed.unlike}
          onShowLess={feed.showLess}
        />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <RNText style={styles.headerTitle}>Flöde</RNText>
          <View style={styles.headerIcons}>
            <ScaleButton hitSlop={8} scaleTo={0.90}>
              <RNText style={styles.headerIcon}>{'\u2630'}</RNText>
            </ScaleButton>
            <ScaleButton hitSlop={8} scaleTo={0.90}>
              <RNText style={styles.headerIcon}>{'\uD83D\uDD14'}</RNText>
            </ScaleButton>
          </View>
        </View>

        {/* Tab pills */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <ScaleButton
              key={tab}
              onPress={() => setActiveTab(tab)}
              scaleTo={0.95}
            >
              <View
                style={[
                  styles.tabPill,
                  activeTab === tab ? styles.tabPillActive : styles.tabPillInactive,
                ]}
              >
                <RNText
                  style={[
                    styles.tabText,
                    activeTab === tab ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  {tab}
                </RNText>
              </View>
            </ScaleButton>
          ))}
        </View>
      </View>

      {/* Feed list */}
      <FlatList
        data={items}
        keyExtractor={(item: FeedItem) =>
          item.type === 'ad' ? `ad-${item.campaignId}-${item.creativeId}` : item.id
        }
        contentContainerStyle={styles.feedList}
        renderItem={renderItem}
        ListHeaderComponent={<StickyNote />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => feed.refetch()}
            tintColor={COPPER_DARK}
            colors={[COPPER_DARK]}
          />
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <YStack padding={24} alignItems="center">
              <Spinner color={COPPER_DARK} />
            </YStack>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            title="Inget i flödet ännu"
            description="Följ profiler och grupper för att se innehåll här. Ditt flöde fylls på med tiden."
            action={{ label: 'Utforska', onPress: () => router.push('/discover') }}
          />
        }
      />

      {/* FAB — Create post */}
      {onCreatePost && (
        <ScaleButton
          onPress={onCreatePost}
          style={styles.fab}
          scaleTo={0.90}
        >
          <View style={styles.fabButton}>
            <RNText style={styles.fabIcon}>{'\uD83D\uDCF7'}</RNText>
          </View>
        </ScaleButton>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WARM_CREAM,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: WARM_CREAM,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    fontFamily: 'System',
    color: COPPER,
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 22,
    color: CHARCOAL,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabPillActive: {
    backgroundColor: COPPER_DARK,
  },
  tabPillInactive: {
    backgroundColor: 'rgba(29, 27, 25, 0.04)',
  },
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabTextInactive: {
    fontWeight: '500',
    color: WARM_GRAY,
  },
  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemSpacing: {
    marginBottom: 64, // space-y-16 equivalent
  },
  // Sticky note
  stickyNote: {
    backgroundColor: 'rgba(212, 168, 67, 0.20)', // gold/20
    padding: 24,
    borderRadius: 12,
    marginBottom: 32,
    transform: [{ rotate: '-1deg' }, { translateX: 8 }],
    position: 'relative',
  },
  pushPinWrapper: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  pushPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COPPER,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  pushPinInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  stickyNoteText: {
    fontFamily: 'Caveat_400Regular',
    fontSize: 18,
    color: CHARCOAL,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 4,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    // Copper-to-gold gradient approximation (solid copper as RN doesn't do CSS gradients in StyleSheet)
    backgroundColor: COPPER,
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
})
