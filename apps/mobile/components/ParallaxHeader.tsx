/**
 * ParallaxHeader
 *
 * A reusable parallax header component combining scroll-driven animation,
 * Ken Burns zoom, and gradient overlay for text readability.
 *
 * Features:
 *  - Parallax background image that moves slower than scroll
 *  - Scale-up effect on overscroll (pull to refresh visual)
 *  - Ken Burns slow zoom on mount (1 → 1.05 over 8s)
 *  - Optional gradient overlay at bottom of header for text contrast
 *  - Fades out header opacity as user scrolls down
 *  - Accessibility: respects reduced-motion setting
 *  - Safe area insets handled automatically
 *
 * Usage:
 *   <ParallaxHeader
 *     imageUri="https://example.com/photo.jpg"
 *     headerHeight={300}
 *     overlayGradient={true}
 *   >
 *     <View>
 *       <Text>Name, age, badges</Text>
 *       <Text>Bio or additional info</Text>
 *     </View>
 *   </ParallaxHeader>
 */

import React from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useParallax } from '@/hooks/useParallax'
import { useKenBurns } from '@/hooks/useKenBurns'
import { COLORS, SPACING } from '@/constants/tokens'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export interface ParallaxHeaderProps {
  /** Image URI for the parallax header background */
  imageUri: string
  /** Height of the parallax header region. Default: 300 */
  headerHeight?: number
  /** Content to render below the header (overlay on image bottom, scrolls with content) */
  children?: React.ReactNode
  /** Show bottom gradient overlay for text readability over image. Default: true */
  overlayGradient?: boolean
}

export function ParallaxHeader({
  imageUri,
  headerHeight = 300,
  children,
  overlayGradient = true,
}: ParallaxHeaderProps) {

  // Parallax hook for scroll tracking
  const { scrollHandler, headerAnimatedStyle } = useParallax({
    headerHeight,
    parallaxFactor: 0.5,
    scaleOnOverscroll: true,
    maxScale: 1.3,
  })

  // Ken Burns zoom animation on mount
  const { kenBurnsStyle } = useKenBurns(true)

  return (
    <Animated.ScrollView
      scrollEventThrottle={16}
      onScroll={scrollHandler}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Parallax header image with Ken Burns zoom */}
      <Animated.View
        style={[
          styles.headerContainer,
          { height: headerHeight },
          headerAnimatedStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.imageWrapper,
            { height: headerHeight },
            kenBurnsStyle,
          ]}
        >
          <Animated.Image
            source={{ uri: imageUri }}
            style={[
              styles.headerImage,
              { height: headerHeight },
            ]}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Gradient overlay for text readability */}
        {overlayGradient && (
          <LinearGradient
            colors={[
              `${COLORS.charcoal}00`,
              `${COLORS.charcoal}40`,
              `${COLORS.charcoal}80`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.gradientOverlay,
              { height: headerHeight },
            ]}
          />
        )}

        {/* Children render inside header, overlaid on image */}
        {children && (
          <View
            style={[
              styles.headerContent,
              { paddingTop: SPACING.lg, paddingBottom: SPACING.xl },
            ]}
          >
            {children}
          </View>
        )}
      </Animated.View>
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
  },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
  },
  headerImage: {
    width: SCREEN_WIDTH,
    backgroundColor: COLORS.charcoal,
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    left: 0,
    bottom: 0,
  },
  headerContent: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
  },
})
