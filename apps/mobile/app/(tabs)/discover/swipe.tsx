import { useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width: screenWidth } = Dimensions.get('window')

// Design tokens from Stitch
const COPPER = '#894D0D'
const OUTLINE_VARIANT = '#d8c3b4'
const LOCATION_COLOR = '#857467'
const SCREEN_BG = '#fff8f6'
const CARD_BG = '#ffffff'

const CARD_WIDTH = screenWidth - 64
const CARD_PADDING_SIDE = 12
const CARD_PADDING_TOP = 12
const CARD_PADDING_BOTTOM = 40
const PHOTO_WIDTH = CARD_WIDTH - CARD_PADDING_SIDE * 2
const PHOTO_HEIGHT = PHOTO_WIDTH * (5 / 4) // aspect-ratio 4/5

const mockProfile = {
  displayName: 'Saga',
  age: 26,
  location: 'Södermalm',
  matchPercentage: 87,
  seeking: 'Söker relation',
  photos: [{ url: 'https://picsum.photos/400/500' }],
}

export default function SwipeScreen() {
  const [profile] = useState(mockProfile)

  const handleRewind = useCallback(() => {
    // Rewind action
  }, [])

  const handlePass = useCallback(() => {
    // Pass action
  }, [])

  const handleSuperLike = useCallback(() => {
    // Super-like action
  }, [])

  const handleLike = useCallback(() => {
    // Like action
  }, [])

  const handleBoost = useCallback(() => {
    // Boost action
  }, [])

  return (
    <View style={styles.screen}>
      {/* Polaroid Card — centered */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Photo */}
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: profile.photos[0].url }}
              style={styles.photo}
              resizeMode="cover"
            />

            {/* Match badge — top-right */}
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>
                {profile.matchPercentage}% MATCH
              </Text>
            </View>

            {/* Intent pill — bottom-right */}
            <View style={styles.intentPill}>
              <Text style={styles.intentPillText}>
                {profile.seeking.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Name + Location in the white bottom strip */}
          <View style={styles.cardInfo}>
            <Text style={styles.nameText}>
              {profile.displayName}, {profile.age}
            </Text>
            <View style={styles.locationRow}>
              <MaterialIcons
                name="location-on"
                size={13}
                color={LOCATION_COLOR}
              />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action buttons row */}
      <View style={styles.actionsRow}>
        {/* Rewind — 40px outline */}
        <Pressable
          style={[styles.actionBtn, styles.actionBtnSmall]}
          onPress={handleRewind}
          accessibilityLabel="Rewind"
          accessibilityRole="button"
        >
          <MaterialIcons name="undo" size={20} color={COPPER} />
        </Pressable>

        {/* Pass — 52px outline */}
        <Pressable
          style={[styles.actionBtn, styles.actionBtnMedium]}
          onPress={handlePass}
          accessibilityLabel="Pass"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={26} color={COPPER} />
        </Pressable>

        {/* Super-like — 64px copper gradient */}
        <Pressable
          onPress={handleSuperLike}
          accessibilityLabel="Super-like"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#894D0D', '#8C4F10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.actionBtnGradient, styles.actionBtnLarge]}
          >
            <MaterialIcons name="star" size={32} color="#ffffff" />
          </LinearGradient>
        </Pressable>

        {/* Like — 52px copper gradient */}
        <Pressable
          onPress={handleLike}
          accessibilityLabel="Like"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#894D0D', '#8C4F10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.actionBtnGradient, styles.actionBtnMedium]}
          >
            <MaterialIcons name="favorite" size={26} color="#ffffff" />
          </LinearGradient>
        </Pressable>

        {/* Boost — 40px outline */}
        <Pressable
          style={[styles.actionBtn, styles.actionBtnSmall]}
          onPress={handleBoost}
          accessibilityLabel="Boost"
          accessibilityRole="button"
        >
          <MaterialIcons name="bolt" size={20} color={COPPER} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SCREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card container — centers the Polaroid vertically
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  // Polaroid card
  card: {
    width: CARD_WIDTH,
    backgroundColor: CARD_BG,
    paddingTop: CARD_PADDING_TOP,
    paddingHorizontal: CARD_PADDING_SIDE,
    paddingBottom: CARD_PADDING_BOTTOM,
    borderRadius: 4,
    transform: [{ rotate: '-1.5deg' }],

    // Shadow: 0 12px 40px rgba(33,26,23,0.12)
    shadowColor: 'rgba(33,26,23,1)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
  },

  photoContainer: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  // Match badge — top-right on photo
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  matchBadgeText: {
    color: COPPER,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Intent pill — bottom-right on photo
  intentPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COPPER,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },

  intentPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Card info area (white bottom strip)
  cardInfo: {
    paddingTop: 12,
    alignItems: 'center',
  },

  nameText: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Manrope',
    color: '#1d1b19',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },

  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: LOCATION_COLOR,
  },

  // Action buttons row
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 32,
  },

  // Outline button base
  actionBtn: {
    borderWidth: 1.5,
    borderColor: OUTLINE_VARIANT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  // Small — 40px (rewind, boost)
  actionBtnSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // Medium — 52px (pass, like)
  actionBtnMedium: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  // Large — 64px (super-like)
  actionBtnLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  // Gradient button (no border, used for super-like and like)
  actionBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
