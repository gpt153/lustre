import React, { useCallback } from 'react'
import { View, Text as RNText, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { PolaroidCard } from '@lustre/ui'

const COPPER = '#B87333'
const CHARCOAL = '#2C2421'

interface PolaroidFeedCardProps {
  post: {
    id: string
    text: string | null
    createdAt: Date
    author: { id: string; displayName: string | null; avatarUrl: string | null }
    media: Array<{ id: string; url: string; thumbnailMedium: string | null }>
    likeCount: number
    isLiked: boolean
  }
  rotation: number
  onLike: (postId: string) => void
  onUnlike: (postId: string) => void
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'nu'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

export function PolaroidFeedCard({ post, rotation, onLike, onUnlike }: PolaroidFeedCardProps) {
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()

  // Card takes up most of the screen width, with some padding
  const cardWidth = Math.min(screenWidth - 48, 360)

  const firstMedia = post.media[0]
  const imageUrl = firstMedia?.thumbnailMedium ?? firstMedia?.url

  const handlePress = useCallback(() => {
    // Navigate to post detail if needed
  }, [post.id])

  const handleLikePress = useCallback(() => {
    if (post.isLiked) {
      onUnlike(post.id)
    } else {
      onLike(post.id)
    }
  }, [post.isLiked, post.id, onLike, onUnlike])

  const authorInitial = (post.author.displayName ?? '?')[0]?.toUpperCase() ?? '?'
  const timeAgo = getTimeAgo(post.createdAt)

  return (
    <View style={[styles.container, { alignItems: 'center' }]}>
      <PolaroidCard
        cardWidth={cardWidth}
        imageUrl={imageUrl}
        imageAlt={post.text ?? 'Post image'}
        rotation={rotation}
        onPress={handlePress}
      >
        {/* Author overlay at top-left of image */}
        <View style={styles.authorOverlay}>
          <View style={styles.authorBadge}>
            <RNText style={styles.authorInitial}>{authorInitial}</RNText>
          </View>
          <View style={styles.authorInfo}>
            <RNText style={styles.authorName} numberOfLines={1}>
              {post.author.displayName ?? 'Anonym'}
            </RNText>
            <RNText style={styles.authorTime}>{timeAgo}</RNText>
          </View>
        </View>
      </PolaroidCard>

      {/* Bottom strip actions — rendered outside PolaroidCard, positioned over the white strip */}
      <View
        style={[
          styles.bottomStrip,
          {
            width: cardWidth - 16,
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
      >
        {/* Caption on the left */}
        {post.text ? (
          <RNText style={styles.caption} numberOfLines={2}>
            {post.text}
          </RNText>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Actions on the right */}
        <View style={styles.actions}>
          <Pressable onPress={handleLikePress} style={styles.actionButton} hitSlop={8}>
            <RNText style={[styles.actionIcon, post.isLiked && styles.actionIconActive]}>
              {post.isLiked ? '\u2665' : '\u2661'}
            </RNText>
            {post.likeCount > 0 && (
              <RNText style={[styles.actionCount, post.isLiked && styles.actionCountActive]}>
                {post.likeCount}
              </RNText>
            )}
          </Pressable>
          <Pressable style={styles.actionButton} hitSlop={8}>
            <RNText style={styles.actionIcon}>{'\uD83D\uDCAC'}</RNText>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  authorOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  authorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COPPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authorInfo: {
    flexDirection: 'column',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: 120,
  },
  authorTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  bottomStrip: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  caption: {
    flex: 1,
    fontFamily: 'Caveat_400Regular',
    fontSize: 16,
    color: CHARCOAL,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionIcon: {
    fontSize: 18,
    color: COPPER,
  },
  actionIconActive: {
    color: COPPER,
  },
  actionCount: {
    fontSize: 13,
    color: CHARCOAL,
    fontWeight: '500',
  },
  actionCountActive: {
    color: COPPER,
  },
})
