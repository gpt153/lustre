/**
 * FeedSkeleton
 *
 * Matches the FeedScreen / PostCard layout:
 *   - Avatar circle (40pt) + display name + timestamp in header row
 *   - Full-width post image (16:9 ratio)
 *   - Caption text (2 lines)
 *   - Interaction row (like + comment counts)
 */

import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Skeleton } from '@/components/Skeleton'
import { SPACING } from '@/constants/tokens'

const SCREEN_WIDTH = Dimensions.get('window').width
const POST_IMAGE_HEIGHT = Math.round(SCREEN_WIDTH * (9 / 16))
const CARD_HORIZONTAL_PAD = SPACING.md
const TEXT_AREA_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PAD * 2

const AVATAR_SIZE = 40
const POST_COUNT = 3

function PostCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Header: avatar + name + timestamp */}
      <View style={styles.header}>
        <Skeleton.Circle diameter={AVATAR_SIZE} />
        <View style={styles.headerText}>
          <Skeleton.Box width={120} height={14} borderRadius={4} />
          <Skeleton.Box width={72} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Post image */}
      <Skeleton.Box
        width={SCREEN_WIDTH}
        height={POST_IMAGE_HEIGHT}
        borderRadius={0}
      />

      {/* Caption */}
      <View style={styles.caption}>
        <Skeleton.Text
          lines={2}
          lineHeight={14}
          lineSpacing={6}
          containerWidth={TEXT_AREA_WIDTH}
        />
      </View>

      {/* Interaction row: like + comment pills */}
      <View style={styles.actions}>
        <Skeleton.Box width={56} height={24} borderRadius={12} />
        <Skeleton.Box width={56} height={24} borderRadius={12} />
      </View>
    </View>
  )
}

export function FeedSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading feed">
      {Array.from({ length: POST_COUNT }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  card: {
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: CARD_HORIZONTAL_PAD,
  },
  headerText: {
    flex: 1,
    gap: SPACING.xs,
  },
  caption: {
    paddingHorizontal: CARD_HORIZONTAL_PAD,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: CARD_HORIZONTAL_PAD,
  },
})
