/**
 * ProfileSkeleton
 *
 * Matches the ProfileViewScreen layout:
 *   - Large hero photo (full width, 360pt tall)
 *   - Name + age row
 *   - 2-column photo grid (3 smaller photos)
 *   - Bio text block (3 lines)
 *   - Kink tag row (pill shapes)
 */

import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Skeleton } from '@/components/Skeleton'
import { SPACING } from '@/constants/tokens'

const SCREEN_WIDTH = Dimensions.get('window').width
const GRID_GAP = SPACING.sm
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - SPACING.md * 2 - GRID_GAP) / 2

export function ProfileSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading profile">
      {/* Hero photo */}
      <Skeleton.Box
        width={SCREEN_WIDTH}
        height={360}
        borderRadius={0}
      />

      <View style={styles.inner}>
        {/* Name + age */}
        <View style={styles.nameRow}>
          <Skeleton.Box width={180} height={26} borderRadius={6} />
          <Skeleton.Box width={32} height={26} borderRadius={6} />
        </View>

        {/* Location / distance line */}
        <Skeleton.Box width={120} height={14} borderRadius={4} />

        {/* Photo grid — 3 additional photos in 2-column layout */}
        <View style={styles.photoGrid}>
          <Skeleton.Box
            width={GRID_ITEM_WIDTH}
            height={GRID_ITEM_WIDTH}
            borderRadius={12}
          />
          <Skeleton.Box
            width={GRID_ITEM_WIDTH}
            height={GRID_ITEM_WIDTH}
            borderRadius={12}
          />
          <Skeleton.Box
            width={GRID_ITEM_WIDTH}
            height={GRID_ITEM_WIDTH}
            borderRadius={12}
          />
        </View>

        {/* Bio section header */}
        <Skeleton.Box width={60} height={16} borderRadius={4} />

        {/* Bio text */}
        <Skeleton.Text
          lines={3}
          lineHeight={15}
          lineSpacing={7}
          containerWidth={SCREEN_WIDTH - SPACING.md * 2}
        />

        {/* Kink tag pills */}
        <View style={styles.tagRow}>
          <Skeleton.Box width={80} height={28} borderRadius={14} />
          <Skeleton.Box width={96} height={28} borderRadius={14} />
          <Skeleton.Box width={72} height={28} borderRadius={14} />
          <Skeleton.Box width={88} height={28} borderRadius={14} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
})
