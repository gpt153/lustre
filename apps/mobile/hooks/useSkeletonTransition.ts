/**
 * useSkeletonTransition
 *
 * Provides a Reanimated opacity crossfade from skeleton to real content.
 * The skeleton renders on top with opacity 1 → 0 (200ms withTiming).
 * Real content renders underneath at all times — zero layout shift.
 *
 * Usage:
 *   const { skeletonStyle, onDataLoaded } = useSkeletonTransition()
 *
 *   return (
 *     <View>
 *       <RealContent onLoad={onDataLoaded} />
 *       <Animated.View style={[StyleSheet.absoluteFill, skeletonStyle]} pointerEvents="none">
 *         <MySkeleton />
 *       </Animated.View>
 *     </View>
 *   )
 */

import { useCallback } from 'react'
import {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated'
import { TIMING } from '@/constants/animations'

interface SkeletonTransition {
  /** Animated style to apply to the skeleton wrapper (opacity 1→0). */
  skeletonStyle: ReturnType<typeof useAnimatedStyle>
  /** Call this when your data has loaded to trigger the crossfade. */
  onDataLoaded: () => void
  /** Reset opacity back to 1 (e.g. on pull-to-refresh). */
  reset: () => void
}

export function useSkeletonTransition(): SkeletonTransition {
  const opacity = useSharedValue(1)

  const skeletonStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const onDataLoaded = useCallback(() => {
    opacity.value = withTiming(0, {
      duration: TIMING.fast, // 200ms
      easing: Easing.out(Easing.ease),
    })
  }, [opacity])

  const reset = useCallback(() => {
    opacity.value = 1
  }, [opacity])

  return { skeletonStyle, onDataLoaded, reset }
}
