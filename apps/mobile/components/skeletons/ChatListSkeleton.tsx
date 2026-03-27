/**
 * ChatListSkeleton
 *
 * Matches the ConversationListScreen row shape:
 *   - Avatar circle (48pt)
 *   - Name line (bold, medium width)
 *   - Message preview line (shorter, lighter)
 *   - Timestamp pill (top-right)
 */

import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Skeleton } from '@/components/Skeleton'
import { SPACING } from '@/constants/tokens'

const SCREEN_WIDTH = Dimensions.get('window').width
const ROW_TEXT_WIDTH = SCREEN_WIDTH - SPACING.md * 2 - 48 - SPACING.sm  // total - padding - avatar - gap

const AVATAR_SIZE = 48
const ROW_COUNT = 7  // number of placeholder rows

function ConversationRow() {
  return (
    <View style={styles.row}>
      {/* Avatar */}
      <Skeleton.Circle diameter={AVATAR_SIZE} />

      {/* Text column */}
      <View style={styles.textCol}>
        <View style={styles.nameRow}>
          {/* Name */}
          <Skeleton.Box width={Math.round(ROW_TEXT_WIDTH * 0.45)} height={14} borderRadius={4} />
          {/* Timestamp */}
          <Skeleton.Box width={40} height={12} borderRadius={4} />
        </View>
        {/* Last message */}
        <Skeleton.Box width={Math.round(ROW_TEXT_WIDTH * 0.72)} height={13} borderRadius={4} />
      </View>
    </View>
  )
}

export function ChatListSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading conversations">
      {Array.from({ length: ROW_COUNT }).map((_, i) => (
        <ConversationRow key={i} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(184,115,51,0.08)',
  },
  textCol: {
    flex: 1,
    gap: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
