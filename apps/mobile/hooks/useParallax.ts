/**
 * useParallax
 *
 * A scroll-driven parallax hook for creating depth-layered header animations.
 *
 * The hook:
 *  - Tracks scroll position via useAnimatedScrollHandler
 *  - Moves the background image slower than the scroll (parallax effect)
 *  - Scales up on overscroll (negative scrollY) with elastic decay
 *  - Fades out opacity as user scrolls past the header
 *  - Respects useReducedMotion accessibility setting
 *
 * Usage:
 *   const { scrollHandler, headerAnimatedStyle, scrollY } = useParallax({
 *     headerHeight: 300,
 *     parallaxFactor: 0.5,
 *     scaleOnOverscroll: true,
 *     maxScale: 1.3,
 *   })
 *
 *   return (
 *     <Animated.ScrollView onScroll={scrollHandler}>
 *       <Animated.Image style={[styles.header, headerAnimatedStyle]} />
 *       <View>{children}</View>
 *     </Animated.ScrollView>
 *   )
 */

import {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated'

export interface UseParallaxOptions {
  /** Height of the parallax header region (px) */
  headerHeight: number
  /** Factor controlling parallax speed (0.5 = bg moves at 50% scroll speed). Default: 0.5 */
  parallaxFactor?: number
  /** Enable scale-up effect on overscroll. Default: true */
  scaleOnOverscroll?: boolean
  /** Maximum scale factor on full overscroll. Default: 1.3 */
  maxScale?: number
}

export interface UseParallaxResult {
  /** Pass to Animated.ScrollView's onScroll handler */
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>
  /** Animated style for the header image container */
  headerAnimatedStyle: ReturnType<typeof useAnimatedStyle>
  /** Shared value tracking current scroll position */
  scrollY: SharedValue<number>
}

export function useParallax(options: UseParallaxOptions): UseParallaxResult {
  const {
    headerHeight,
    parallaxFactor = 0.5,
    scaleOnOverscroll = true,
    maxScale = 1.3,
  } = options

  const reducedMotion = useReducedMotion()
  const scrollY = useSharedValue(0)

  // Effective parallax factor: zero when reduced motion is enabled
  const effectiveParallaxFactor = reducedMotion ? 0 : parallaxFactor

  // Track scroll position
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y
  })

  // Compute animated transforms
  const headerAnimatedStyle = useAnimatedStyle(
    () => {
      const y = scrollY.value

      // Parallax translateY: moves slower than scroll
      const translateY = y * effectiveParallaxFactor

      // Scale on overscroll: when scrollY < 0, scale up
      let scale = 1
      if (scaleOnOverscroll && y < 0) {
        // Map negative scrollY to scale: 0 → maxScale, up to -headerHeight
        scale = interpolate(
          y,
          [-headerHeight, 0],
          [maxScale, 1],
          Extrapolation.CLAMP,
        )
      }

      // Opacity: fade out as user scrolls past header
      // Full opacity at scrollY=0, zero opacity at scrollY=headerHeight
      const opacity = interpolate(
        y,
        [0, headerHeight],
        [1, 0],
        Extrapolation.CLAMP,
      )

      return {
        transform: [{ translateY }, { scale }],
        opacity,
      }
    },
    [effectiveParallaxFactor, scaleOnOverscroll, headerHeight, maxScale],
  )

  return {
    scrollHandler,
    headerAnimatedStyle,
    scrollY,
  }
}
