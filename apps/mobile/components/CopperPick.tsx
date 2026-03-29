/**
 * CopperPick
 *
 * Cinematic daily recommendation card.
 *
 * Layout:
 *   - warmWhite (#fef8f3) full-screen background
 *   - "Lustre Copper Pick" headline in NotoSerif above the card
 *   - PolaroidCard centred on screen with 2° rotation and caption "Dagens val"
 *   - Name + age below the card in Manrope
 *   - Action row (Pass / Visa profil / Like) at the bottom
 *
 * No swipe gesture — buttons only.
 */

import React, { useEffect } from 'react'
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { X, Heart } from 'phosphor-react-native'
import { PolaroidCard } from '@lustre/ui'
import { COLORS, SPACING } from '@/constants/tokens'
import { SPRING, TIMING } from '@/constants/animations'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CopperPickProps {
  profile: {
    displayName: string
    age?: number
    photos?: Array<{ url?: string | null; thumbnailLarge?: string | null }>
  }
  onLike: () => void
  onPass: () => void
  onViewProfile: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH - 64
const CARD_ROTATION = 2

// ---------------------------------------------------------------------------
// PressableScale — scales element on press
// ---------------------------------------------------------------------------

interface PressableScaleProps {
  children: React.ReactNode
  onPress: () => void
  style?: object
  accessibilityLabel?: string
}

function PressableScale({
  children,
  onPress,
  style,
  accessibilityLabel,
}: PressableScaleProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.93, SPRING.snappy)
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING.snappy)
        }}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CopperPick({ profile, onLike, onPass, onViewProfile }: CopperPickProps) {
  // Entrance animation — card slides up from slightly below
  const cardTranslateY = useSharedValue(40)
  const cardOpacity = useSharedValue(0)
  const headerOpacity = useSharedValue(0)
  const actionsOpacity = useSharedValue(0)

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: TIMING.medium })
    cardTranslateY.value = withSpring(0, SPRING.gentle)
    cardOpacity.value = withTiming(1, { duration: TIMING.medium })
    actionsOpacity.value = withTiming(1, { duration: TIMING.medium })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }))

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }))

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }))

  // Resolve photo URI
  const firstPhoto = profile.photos?.[0]
  const photoUri = firstPhoto?.thumbnailLarge ?? firstPhoto?.url ?? null

  const nameLabel =
    profile.age != null
      ? `${profile.displayName}, ${profile.age}`
      : profile.displayName

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={styles.headerTitle}>Lustre Copper Pick</Text>
      </Animated.View>

      {/* Card + name, centred in remaining flex space */}
      <View style={styles.cardArea}>
        <Animated.View style={cardAnimatedStyle}>
          {photoUri != null ? (
            <PolaroidCard
              cardWidth={CARD_WIDTH}
              imageSource={{ uri: photoUri }}
              caption="Dagens val"
              rotation={CARD_ROTATION}
              shadow="lg"
              accessibilityLabel={`Profilbild av ${profile.displayName}`}
            />
          ) : (
            <View
              style={[
                styles.noPhotoPlaceholder,
                { width: CARD_WIDTH, height: CARD_WIDTH * 1.33 },
              ]}
            >
              <Text style={styles.noPhotoText}>
                {(profile.displayName[0] ?? '?').toUpperCase()}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Name + age */}
        <Animated.View style={[styles.nameRow, headerAnimatedStyle]}>
          <Text style={styles.nameText}>{nameLabel}</Text>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <Animated.View style={[styles.actionsRow, actionsAnimatedStyle]}>
        {/* Pass — dark circle */}
        <PressableScale
          onPress={onPass}
          accessibilityLabel={`Neka ${profile.displayName}`}
        >
          <View style={styles.passBtn}>
            <X size={24} weight="bold" color={COLORS.warmWhite} />
          </View>
        </PressableScale>

        {/* View Profile — outlined pill */}
        <PressableScale
          onPress={onViewProfile}
          accessibilityLabel={`Visa profil för ${profile.displayName}`}
        >
          <View style={styles.viewProfileBtn}>
            <Text style={styles.viewProfileLabel}>Visa profil</Text>
          </View>
        </PressableScale>

        {/* Like — copper gradient circle */}
        <PressableScale
          onPress={onLike}
          accessibilityLabel={`Gilla ${profile.displayName}`}
        >
          <LinearGradient
            colors={['#D4A574', '#894d0d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.likeBtn}
          >
            <Heart size={24} weight="fill" color={COLORS.warmWhite} />
          </LinearGradient>
        </PressableScale>
      </Animated.View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },

  // Header
  header: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'NotoSerif_400Regular',
    fontSize: 22,
    color: COLORS.copper,
    letterSpacing: 0.3,
  },

  // Card + name area
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  nameText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 20,
    color: COLORS.charcoal,
    letterSpacing: 0.1,
  },

  // No-photo fallback
  noPhotoPlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoText: {
    fontFamily: 'NotoSerif_400Regular',
    fontSize: 64,
    color: COLORS.copper,
  },

  // Action row
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },

  passBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewProfileBtn: {
    height: 56,
    paddingHorizontal: SPACING.lg,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(216,195,180,0.6)',
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: COLORS.charcoal,
    letterSpacing: 0.2,
  },

  likeBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
