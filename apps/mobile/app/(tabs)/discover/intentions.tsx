import { useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const FILTERS = [
  { key: 'ALL', label: 'Alla', emoji: '' },
  { key: 'CASUAL', label: 'Dejt', emoji: '\u2615' },
  { key: 'RELATIONSHIP', label: 'Relation', emoji: '\uD83D\uDC95' },
  { key: 'FRIENDSHIP', label: 'Vänskap', emoji: '\uD83E\uDD1D' },
  { key: 'EXPLORATION', label: 'Öppet', emoji: '\uD83C\uDF08' },
  { key: 'EVENT', label: 'Event', emoji: '\uD83C\uDFAD' },
]

const mockProfiles = [
  {
    name: 'Emma',
    age: 28,
    seeking: 'Söker dejt',
    seekingEmoji: '\u2615',
    match: 92,
    photo: 'https://picsum.photos/400/500',
  },
  {
    name: 'Alex',
    age: 31,
    seeking: 'Söker relation',
    seekingEmoji: '\uD83D\uDC95',
    match: 85,
    photo: 'https://picsum.photos/401/500',
  },
  {
    name: 'Nova',
    age: 26,
    seeking: 'Söker vänskap',
    seekingEmoji: '\uD83E\uDD1D',
    match: 78,
    photo: 'https://picsum.photos/402/500',
  },
]

export default function IntentionsScreen() {
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePass = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, mockProfiles.length - 1))
  }, [])

  const handleLike = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, mockProfiles.length - 1))
  }, [])

  const currentProfile = mockProfiles[currentIndex]
  const nextProfile = mockProfiles[currentIndex + 1]
  const backProfile = mockProfiles[currentIndex + 2]

  return (
    <View style={styles.container}>
      {/* Filter pill row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScrollView}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key
          const label = filter.emoji
            ? `${filter.emoji} ${filter.label}`
            : filter.label

          if (isActive) {
            return (
              <LinearGradient
                key={filter.key}
                colors={['#894D0D', '#8C4F10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.pill, styles.pillActive]}
              >
                <Pressable onPress={() => setActiveFilter(filter.key)}>
                  <Text style={styles.pillTextActive}>{label}</Text>
                </Pressable>
              </LinearGradient>
            )
          }

          return (
            <Pressable
              key={filter.key}
              style={[styles.pill, styles.pillInactive]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={styles.pillTextInactive}>{label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Stats bar */}
      <Text style={styles.statsText}>47 personer söker dejt nära dig</Text>

      {/* Card stack */}
      <View style={styles.cardStackContainer}>
        {/* Back card (no content) */}
        {backProfile && (
          <View
            style={[
              styles.card,
              styles.cardBack,
            ]}
          />
        )}

        {/* Middle card */}
        {nextProfile && (
          <View
            style={[
              styles.card,
              styles.cardMiddle,
            ]}
          >
            <View style={styles.cardPhotoContainer}>
              <Image
                source={{ uri: nextProfile.photo }}
                style={styles.cardPhoto}
                resizeMode="cover"
              />
            </View>
          </View>
        )}

        {/* Front card */}
        {currentProfile && (
          <View style={[styles.card, styles.cardFront]}>
            <View style={styles.cardPhotoContainer}>
              <Image
                source={{ uri: currentProfile.photo }}
                style={styles.cardPhoto}
                resizeMode="cover"
              />
              {/* Match badge */}
              <View style={styles.matchBadge}>
                <Text style={styles.matchLabel}>Match </Text>
                <Text style={styles.matchValue}>{currentProfile.match}%</Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>
                {currentProfile.name}, {currentProfile.age}
              </Text>
              <Text style={styles.cardSeeking}>
                {currentProfile.seekingEmoji} {currentProfile.seeking}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          style={styles.passButton}
          onPress={handlePass}
          accessibilityLabel="Pass"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={30} color="#857467" />
        </Pressable>

        <LinearGradient
          colors={['#894D0D', '#8C4F10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.likeButton}
        >
          <Pressable
            onPress={handleLike}
            style={styles.likeButtonInner}
            accessibilityLabel="Like"
            accessibilityRole="button"
          >
            <MaterialIcons name="favorite" size={30} color="#ffffff" />
          </Pressable>
        </LinearGradient>
      </View>

      {/* Hint text */}
      <Text style={styles.hintText}>SWIPA ELLER TRYCK FÖR ATT SE PROFIL</Text>
    </View>
  )
}

const CARD_WIDTH = SCREEN_WIDTH - 48
const CARD_HEIGHT = CARD_WIDTH * 1.3

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f6',
  },
  filterScrollView: {
    flexGrow: 0,
    marginTop: 8,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  pillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pillInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d8c3b4',
  },
  pillTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  pillTextInactive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#524439',
  },
  statsText: {
    fontSize: 14,
    color: '#857467',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  cardStackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  cardBack: {
    zIndex: 10,
    opacity: 0.4,
    transform: [{ rotate: '3deg' }, { scale: 0.9 }],
    borderWidth: 0,
  },
  cardMiddle: {
    zIndex: 20,
    opacity: 0.8,
    borderWidth: 12,
    borderColor: '#ffffff',
    transform: [{ rotate: '-2deg' }, { scale: 0.95 }],
  },
  cardFront: {
    zIndex: 30,
    opacity: 1,
    borderWidth: 14,
    borderColor: '#ffffff',
  },
  cardPhotoContainer: {
    flex: 0.78,
    backgroundColor: '#faebe5',
    overflow: 'hidden',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchLabel: {
    fontSize: 12,
    color: '#857467',
    fontWeight: '500',
  },
  matchValue: {
    fontSize: 14,
    color: '#894D0D',
    fontWeight: '700',
  },
  cardInfo: {
    flex: 0.22,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#211a17',
  },
  cardSeeking: {
    fontSize: 14,
    color: '#857467',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingVertical: 16,
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(216, 195, 180, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  likeButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#857467',
    letterSpacing: 1,
    paddingBottom: 16,
    textTransform: 'uppercase',
  },
})
