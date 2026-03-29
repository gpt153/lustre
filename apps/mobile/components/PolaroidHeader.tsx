/**
 * PolaroidHeader
 *
 * Glassmorphic top app bar matching the Stitch design reference.
 * Warm white at 60% opacity with backdrop blur, copper title and icons,
 * warm diffused shadow below.
 *
 * Usage:
 *   <PolaroidHeader title="Flöde" />
 *   <PolaroidHeader title="Meddelanden" showBack onBack={() => router.back()} />
 *   <PolaroidHeader title="Utforska" rightIcon="Bell" onRightPress={openNotifs} />
 */

import React, { useCallback } from 'react'
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, type Icon as PhosphorIcon } from 'phosphor-react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated'
import { COLORS, SPACING } from '@/constants/tokens'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PolaroidHeaderProps {
  /** Screen title displayed center-aligned in copper heading font */
  title: string
  /** Show a back arrow on the left side */
  showBack?: boolean
  /** Callback when back arrow is pressed */
  onBack?: () => void
  /** Optional right-side action callback */
  onRightPress?: () => void
  /** Optional right-side Phosphor icon component */
  rightIcon?: PhosphorIcon
  /** Optional accessibility label for the right action */
  rightAccessibilityLabel?: string
}

// ---------------------------------------------------------------------------
// Animated icon button (press scale 0.95)
// ---------------------------------------------------------------------------

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function IconButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress?: () => void
  accessibilityLabel: string
  children: React.ReactNode
}) {
  const scale = useSharedValue(1)
  const reducedMotion = useReducedMotion()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
    }
  }, [reducedMotion, scale])

  const handlePressOut = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    }
  }, [reducedMotion, scale])

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.iconButton, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      {children}
    </AnimatedPressable>
  )
}

// ---------------------------------------------------------------------------
// PolaroidHeader
// ---------------------------------------------------------------------------

export function PolaroidHeader({
  title,
  showBack,
  onBack,
  onRightPress,
  rightIcon: RightIcon,
  rightAccessibilityLabel,
}: PolaroidHeaderProps) {
  const insets = useSafeAreaInsets()

  const content = (
    <View style={[styles.contentRow, { paddingTop: insets.top + 8 }]}>
      {/* Left slot */}
      <View style={styles.sideSlot}>
        {showBack && (
          <IconButton onPress={onBack} accessibilityLabel="Gå tillbaka">
            <ArrowLeft size={24} weight="regular" color={COLORS.copper} />
          </IconButton>
        )}
      </View>

      {/* Title */}
      <Text
        style={styles.title}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>

      {/* Right slot */}
      <View style={styles.sideSlot}>
        {RightIcon && onRightPress && (
          <IconButton
            onPress={onRightPress}
            accessibilityLabel={rightAccessibilityLabel ?? 'Åtgärd'}
          >
            <RightIcon size={24} weight="regular" color={COLORS.copper} />
          </IconButton>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' ? (
        <View style={[styles.blurFallback, styles.bottomBorder]}>
          {content}
        </View>
      ) : (
        <BlurView intensity={60} tint="light" style={styles.bottomBorder}>
          <View style={styles.blurOverlay}>{content}</View>
        </BlurView>
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const HEADER_BG = 'rgba(255, 248, 246, 0.60)'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    // Warm shadow below — iOS
    shadowColor: '#211a17',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    // Shadow — Android
    elevation: 4,
  },
  blurFallback: {
    backgroundColor: 'rgba(255, 248, 246, 0.92)',
  },
  blurOverlay: {
    backgroundColor: HEADER_BG,
  },
  bottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(216, 195, 180, 0.20)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 12,
  },
  sideSlot: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'NotoSerif_700Bold',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.copper,
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
})

export default PolaroidHeader
