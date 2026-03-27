/**
 * StoryProgressBar
 *
 * Segmented horizontal progress indicator shown at the top of the story card.
 * Uses react-native-svg Rect elements so the fill animation is driven by
 * Reanimated animatedProps on the UI thread.
 *
 * Design spec:
 * - Copper (#B87333) fill for viewed / current segment
 * - Warm gray (#E8DDD3) track for all segments
 * - 3px height, 2px gap between segments, 1.5px corner radius
 */

import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Rect } from 'react-native-svg'
import { COLORS } from '@/constants/tokens'
import { TIMING } from '@/constants/animations'

const AnimatedRect = Animated.createAnimatedComponent(Rect)

const BAR_HEIGHT = 3
const GAP = 2
const CORNER_RADIUS = 1.5

interface SegmentProps {
  segmentWidth: number
  isSeen: boolean
  isCurrent: boolean
  /** 0–1 progress fraction through the current segment. */
  segmentProgress: number
}

function ProgressSegment({ segmentWidth, isSeen, isCurrent, segmentProgress }: SegmentProps) {
  const fillWidth = useSharedValue(isSeen ? segmentWidth : 0)

  useEffect(() => {
    if (isSeen) {
      fillWidth.value = withTiming(segmentWidth, {
        duration: TIMING.fast,
        easing: Easing.out(Easing.quad),
      })
    } else if (isCurrent) {
      fillWidth.value = withTiming(segmentProgress * segmentWidth, {
        duration: TIMING.instant,
        easing: Easing.linear,
      })
    } else {
      fillWidth.value = withTiming(0, {
        duration: TIMING.fast,
        easing: Easing.out(Easing.quad),
      })
    }
  }, [isSeen, isCurrent, segmentProgress, segmentWidth, fillWidth])

  const animatedFillProps = useAnimatedProps(() => ({
    width: Math.max(0, fillWidth.value),
  }))

  return (
    <Svg width={segmentWidth} height={BAR_HEIGHT}>
      <Rect
        x={0}
        y={0}
        width={segmentWidth}
        height={BAR_HEIGHT}
        rx={CORNER_RADIUS}
        fill="#E8DDD3"
        fillOpacity={0.6}
      />
      <AnimatedRect
        x={0}
        y={0}
        height={BAR_HEIGHT}
        rx={CORNER_RADIUS}
        fill={COLORS.copper}
        animatedProps={animatedFillProps}
      />
    </Svg>
  )
}

export interface StoryProgressBarProps {
  /** Total number of segments. */
  segmentCount: number
  /** Zero-based index of the active segment. */
  currentIndex: number
  /**
   * 0–1 progress fraction through the current segment.
   * Used when auto-advance is enabled to animate the current bar fill.
   * Defaults to 0 (shows the bar as empty at the start of each segment).
   */
  segmentProgress?: number
}

export function StoryProgressBar({
  segmentCount,
  currentIndex,
  segmentProgress = 0,
}: StoryProgressBarProps) {
  const [containerWidth, setContainerWidth] = useState(0)

  if (segmentCount === 0) return null

  const totalGaps = (segmentCount - 1) * GAP
  const segmentWidth =
    containerWidth > 0 ? (containerWidth - totalGaps) / segmentCount : 0

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 &&
        Array.from({ length: segmentCount }, (_, i) => (
          <React.Fragment key={i}>
            <ProgressSegment
              segmentWidth={segmentWidth}
              isSeen={i < currentIndex}
              isCurrent={i === currentIndex}
              segmentProgress={segmentProgress}
            />
            {i < segmentCount - 1 && <View style={styles.gap} />}
          </React.Fragment>
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  gap: {
    width: GAP,
  },
})
