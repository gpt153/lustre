/**
 * DiscoverSkeleton
 *
 * Matches the DiscoverScreen card shape:
 *   - Full-width image rect (roughly 4:5 aspect on a 390pt screen)
 *   - Name + age text lines
 *   - Short bio line
 *   - Like / Pass button row
 */

import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Skeleton } from '@/components/Skeleton'
import { SPACING } from '@/constants/tokens'

const SCREEN_WIDTH = Dimensions.get('window').width
const CARD_WIDTH = SCREEN_WIDTH - SPACING.md * 2  // 16pt padding each side
const CARD_IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.25)  // ~4:5 ratio

export function DiscoverSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading discover cards">
      {/* Card */}
      <View style={styles.card}>
        {/* Profile image placeholder */}
        <Skeleton.Box
          width={CARD_WIDTH}
          height={CARD_IMAGE_HEIGHT}
          borderRadius={16}
        />

        {/* Name + age */}
        <View style={styles.textGroup}>
          <Skeleton.Box width={140} height={22} borderRadius={6} />
          <Skeleton.Box width={36} height={22} borderRadius={6} />
        </View>

        {/* Bio line */}
        <Skeleton.Text
          lines={2}
          lineHeight={14}
          lineSpacing={6}
          containerWidth={CARD_WIDTH - SPACING.md}
        />

        {/* Button row — Like / Pass */}
        <View style={styles.buttonRow}>
          <Skeleton.Box width={64} height={64} borderRadius={32} />
          <Skeleton.Box width={56} height={56} borderRadius={28} />
          <Skeleton.Box width={64} height={64} borderRadius={32} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    gap: SPACING.sm,
  },
  textGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.md,
  },
})
