/**
 * Flöde (Feed) — Community sub-view
 *
 * Vertical scroll of Polaroid-style post cards with engagement actions.
 * Static/mock data for now.
 */

import { useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native'
import {
  Heart,
  ChatCircle,
  BookmarkSimple,
  SealCheck,
  FunnelSimple,
  ArrowLeft,
} from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ---------------------------------------------------------------------------
// Design tokens from Stitch
// ---------------------------------------------------------------------------

const PRIMARY = '#6a3800'
const PRIMARY_CONTAINER = '#894D0D'
const ON_SURFACE = '#211a17'
const OUTLINE = '#857467'
const ON_SURFACE_VARIANT = '#524439'
const SURFACE_CONTAINER_LOWEST = '#ffffff'
const SURFACE_CONTAINER_LOW = '#fff1eb'
const SCREEN_BG = '#fff8f6'
const GHOST_BORDER = 'rgba(216,195,180,0.15)'
const GHOST_BORDER_LIGHT = 'rgba(216,195,180,0.10)'
const WASHI_COLOR = 'rgba(216,195,180,0.40)'

const CARD_PADDING = 12
const CARD_PADDING_BOTTOM = 24

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type Post = {
  id: string
  author: string
  verified: boolean
  timestamp: string
  avatar: string
  photo: string | null
  caption: string | null
  textContent: string | null
  likes: number
  comments: number
  rotation: number
  hasWashi: boolean
  aspectRatio: number
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Emma',
    verified: true,
    timestamp: '2 timmar sedan',
    avatar: 'https://picsum.photos/seed/emma/64/64',
    photo: 'https://picsum.photos/seed/post1/400/400',
    caption: 'Söndag med kaffe \u2615',
    textContent: null,
    likes: 24,
    comments: 3,
    rotation: 1,
    hasWashi: true,
    aspectRatio: 1,
  },
  {
    id: '2',
    author: 'Viktor',
    verified: false,
    timestamp: '5 timmar sedan',
    avatar: 'https://picsum.photos/seed/viktor/64/64',
    photo: null,
    caption: null,
    textContent: 'Någon som vill hänga på Fotografiska imorgon? \uD83D\uDCF8',
    likes: 8,
    comments: 12,
    rotation: 0,
    hasWashi: false,
    aspectRatio: 1,
  },
  {
    id: '3',
    author: 'Saga',
    verified: false,
    timestamp: 'igår',
    avatar: 'https://picsum.photos/seed/saga/64/64',
    photo: 'https://picsum.photos/seed/post3/400/500',
    caption: 'Hittade ljuset \u2728',
    textContent: null,
    likes: 42,
    comments: 5,
    rotation: -2,
    hasWashi: false,
    aspectRatio: 4 / 5,
  },
  {
    id: '4',
    author: 'Alex',
    verified: true,
    timestamp: '2 dagar sedan',
    avatar: 'https://picsum.photos/seed/alex/64/64',
    photo: 'https://picsum.photos/seed/post4/400/400',
    caption: 'Ny tattoo \uD83D\uDDA4',
    textContent: null,
    likes: 67,
    comments: 14,
    rotation: 2,
    hasWashi: true,
    aspectRatio: 1,
  },
  {
    id: '5',
    author: 'Lin',
    verified: false,
    timestamp: '3 dagar sedan',
    avatar: 'https://picsum.photos/seed/lin/64/64',
    photo: null,
    caption: null,
    textContent: 'Tack för en fantastisk kväll alla! Ni är underbara \u2764\uFE0F',
    likes: 31,
    comments: 8,
    rotation: 0,
    hasWashi: false,
    aspectRatio: 1,
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({})

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {mockPosts.map((post) => (
          <View key={post.id} style={styles.postWrapper}>
            {/* Author row */}
            <View style={styles.authorRow}>
              <Image
                source={{ uri: post.avatar }}
                style={styles.avatar}
              />
              <View style={styles.authorInfo}>
                <View style={styles.authorNameRow}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  {post.verified && (
                    <SealCheck
                      size={16}
                      weight="fill"
                      color={PRIMARY_CONTAINER}
                      style={styles.verifiedIcon}
                    />
                  )}
                </View>
                <Text style={styles.timestamp}>
                  {post.timestamp.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Post content */}
            {post.photo ? (
              /* Photo post — Polaroid card */
              <View
                style={[
                  styles.polaroidCard,
                  { transform: [{ rotate: `${post.rotation}deg` }] },
                ]}
              >
                {/* Washi tape */}
                {post.hasWashi && (
                  <View style={styles.washiTape}>
                    <View style={styles.washiTapeInner} />
                  </View>
                )}

                {/* Photo */}
                <View style={styles.photoWrapper}>
                  <Image
                    source={{ uri: post.photo }}
                    style={[
                      styles.photo,
                      {
                        aspectRatio: post.aspectRatio,
                      },
                    ]}
                    resizeMode="cover"
                  />
                </View>

                {/* Caption */}
                {post.caption && (
                  <Text style={styles.caption}>{post.caption}</Text>
                )}
              </View>
            ) : (
              /* Text-only post */
              <View style={styles.textPostCard}>
                <Text style={styles.textPostContent}>
                  {post.textContent}
                </Text>
              </View>
            )}

            {/* Engagement row */}
            <View style={styles.engagementRow}>
              <View style={styles.engagementLeft}>
                <Pressable
                  style={styles.engagementButton}
                  onPress={() => toggleLike(post.id)}
                  accessibilityLabel={
                    liked[post.id] ? 'Ta bort gilla' : 'Gilla'
                  }
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Heart
                    size={20}
                    weight={liked[post.id] ? 'fill' : 'regular'}
                    color={
                      liked[post.id]
                        ? PRIMARY_CONTAINER
                        : ON_SURFACE_VARIANT
                    }
                  />
                  <Text
                    style={[
                      styles.engagementCount,
                      liked[post.id] && styles.engagementCountActive,
                    ]}
                  >
                    {post.likes + (liked[post.id] ? 1 : 0)}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.engagementButton}
                  accessibilityLabel="Kommentarer"
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <ChatCircle
                    size={20}
                    weight="regular"
                    color={ON_SURFACE_VARIANT}
                  />
                  <Text style={styles.engagementCount}>
                    {post.comments}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.engagementButton}
                onPress={() => toggleBookmark(post.id)}
                accessibilityLabel={
                  bookmarked[post.id] ? 'Ta bort bokmärke' : 'Spara'
                }
                accessibilityRole="button"
                hitSlop={8}
              >
                <BookmarkSimple
                  size={20}
                  weight={bookmarked[post.id] ? 'fill' : 'regular'}
                  color={
                    bookmarked[post.id]
                      ? PRIMARY_CONTAINER
                      : ON_SURFACE_VARIANT
                  }
                />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Post wrapper
  postWrapper: {
    marginBottom: 28,
  },

  // Author row
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GHOST_BORDER,
    backgroundColor: SCREEN_BG,
  },
  authorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: ON_SURFACE,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
    color: OUTLINE,
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // Polaroid card
  polaroidCard: {
    backgroundColor: SURFACE_CONTAINER_LOWEST,
    padding: CARD_PADDING,
    paddingBottom: CARD_PADDING_BOTTOM,
    borderWidth: 1,
    borderColor: GHOST_BORDER,
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(33,26,23,1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Washi tape
  washiTape: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -32,
    zIndex: 10,
    transform: [{ rotate: '2deg' }],
  },
  washiTapeInner: {
    width: 64,
    height: 24,
    backgroundColor: WASHI_COLOR,
    borderRadius: 2,
  },

  // Photo
  photoWrapper: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  photo: {
    width: '100%',
    borderRadius: 4,
  },

  // Caption
  caption: {
    fontSize: 18,
    fontStyle: 'italic',
    color: PRIMARY,
    marginTop: 12,
    textAlign: 'center',
  },

  // Text-only post
  textPostCard: {
    backgroundColor: SURFACE_CONTAINER_LOW,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: GHOST_BORDER_LIGHT,
  },
  textPostContent: {
    fontSize: 18,
    lineHeight: 26,
    color: ON_SURFACE,
    textAlign: 'center',
  },

  // Engagement row
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  engagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  engagementCount: {
    fontSize: 12,
    fontWeight: '600',
    color: ON_SURFACE_VARIANT,
  },
  engagementCountActive: {
    color: PRIMARY_CONTAINER,
  },
})
