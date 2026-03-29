import { useState, useCallback } from 'react'
import { StyleSheet, Dimensions, Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { useDiscovery } from '../hooks/useDiscovery'
import { useSwipeGesture } from '../hooks/useSwipeGesture'
import { SwipeCard } from '../components/SwipeCard'
import { SwipeStamp } from '../components/SwipeStamp'
import { MatchAnimation } from '../components/MatchAnimation'
import { EmptyState } from '../components/EmptyState'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const CARD_HEIGHT = screenHeight * 0.85

const STACKED_CARD_SCALE_1 = 0.95
const STACKED_CARD_SCALE_2 = 0.90
const STACKED_CARD_TRANSLATE_Y_1 = 10
const STACKED_CARD_TRANSLATE_Y_2 = 20

// Lustre design tokens — stitch palette
const COPPER = '#894d0d'
const COPPER_LIGHT = '#a76526'
const GOLD = '#D4A843'
const WARM_WHITE = '#fef8f3'
const CHARCOAL = '#2C2421'
const WARM_GRAY = '#8B7E74'
const GOLD_BRIGHT = '#E8B84B'
const EMBER = '#E05A33'
const ON_SURFACE_VARIANT = '#524439'
const OUTLINE = '#857467'
const SURFACE_CONTAINER = '#f2ede8'
const GHOST_BORDER = 'rgba(216, 195, 180, 0.20)'

// Seeking labels in Swedish
const SEEKING_LABELS: Record<string, string> = {
  CASUAL: 'Casual',
  RELATIONSHIP: 'Relation',
  FRIENDSHIP: 'Vanskap',
  EXPLORATION: 'Utforska',
  EVENT: 'Event',
  OTHER: 'Ovrigt',
}

const DISCOVERY_TABS = ['Intentioner', 'Bladdra', 'Matchningar', 'Sok'] as const

function PassIcon() {
  return <Text style={styles.passIconText}>✕</Text>
}

function SuperLikeIcon() {
  return <Text style={styles.superLikeIconText}>★</Text>
}

function LikeIcon() {
  return <Text style={styles.likeIconText}>♥</Text>
}

export function DiscoverScreen() {
  const discovery = useDiscovery()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchVisible, setMatchVisible] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<any>(null)
  const [likePressed, setLikePressed] = useState(false)
  const [passPressed, setPassPressed] = useState(false)
  const [activeTab, setActiveTab] = useState<(typeof DISCOVERY_TABS)[number]>('Bladdra')

  const currentProfile = discovery.profiles[currentIndex]

  const handleSwipedRight = useCallback(async () => {
    if (!currentProfile) return
    const result = await discovery.swipe(currentProfile.userId, 'LIKE')
    if (result.matched) {
      setMatchedProfile({
        displayName: currentProfile.displayName,
        photo: currentProfile.photos?.[0],
      })
      setMatchVisible(true)
    }
    setCurrentIndex((prev) => prev + 1)
  }, [currentProfile, discovery])

  const handleSwipedLeft = useCallback(async () => {
    if (!currentProfile) return
    await discovery.swipe(currentProfile.userId, 'PASS')
    setCurrentIndex((prev) => prev + 1)
  }, [currentProfile, discovery])

  const { gesture, cardAnimatedStyle, likeOpacity, nopeOpacity, resetValues } = useSwipeGesture({
    onSwipedLeft: handleSwipedLeft,
    onSwipedRight: handleSwipedRight,
  })

  const handleLikeButton = async () => {
    if (!currentProfile || discovery.isSwiping) return
    setLikePressed(true)
    const result = await discovery.swipe(currentProfile.userId, 'LIKE')
    if (result.matched) {
      setMatchedProfile({
        displayName: currentProfile.displayName,
        photo: currentProfile.photos?.[0],
      })
      setMatchVisible(true)
    }
    setCurrentIndex((prev) => prev + 1)
    resetValues()
    setLikePressed(false)
  }

  const handlePassButton = async () => {
    if (!currentProfile || discovery.isSwiping) return
    setPassPressed(true)
    await discovery.swipe(currentProfile.userId, 'PASS')
    setCurrentIndex((prev) => prev + 1)
    resetValues()
    setPassPressed(false)
  }

  const behindCard1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: STACKED_CARD_SCALE_1 },
      { translateY: STACKED_CARD_TRANSLATE_Y_1 },
    ],
  }))

  const behindCard2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: STACKED_CARD_SCALE_2 },
      { translateY: STACKED_CARD_TRANSLATE_Y_2 },
    ],
  }))

  if (discovery.isLoading) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={SURFACE_CONTAINER}>
          <Spinner color={COPPER} size="large" />
        </YStack>
      </GestureHandlerRootView>
    )
  }

  if (!currentProfile || currentIndex >= discovery.profiles.length) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <YStack flex={1} backgroundColor={SURFACE_CONTAINER} paddingHorizontal={24}>
          <EmptyState
            title="Inga fler profiler just nu"
            description="Vi jobbar på att hitta fler matchningar åt dig. Kom tillbaka snart."
            action={{
              label: 'Uppdatera',
              onPress: () => {
                setCurrentIndex(0)
                discovery.refetch()
              },
            }}
          />
        </YStack>
      </GestureHandlerRootView>
    )
  }

  const nextProfile = discovery.profiles[currentIndex + 1]
  const nextNextProfile = discovery.profiles[currentIndex + 2]

  // Build interest chips from seeking values
  const seekingChips: string[] = []
  if (currentProfile.seeking) {
    const seekingValues = Array.isArray(currentProfile.seeking)
      ? currentProfile.seeking
      : [currentProfile.seeking]
    seekingValues.forEach((s: string) => {
      if (SEEKING_LABELS[s]) seekingChips.push(SEEKING_LABELS[s])
    })
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.topNav}>
          <XStack alignItems="center" gap={8}>
            <Text style={styles.logoText}>Lustre</Text>
          </XStack>
          <Pressable style={styles.filterButton}>
            <Text style={styles.filterIcon}>☰</Text>
          </Pressable>
        </View>

        {/* Card Stack Area */}
        <View style={styles.cardStack}>
          {nextNextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind2, behindCard2Style]}>
              <SwipeCard profile={nextNextProfile} />
            </Animated.View>
          )}

          {nextProfile && (
            <Animated.View style={[styles.cardWrapper, styles.cardBehind1, behindCard1Style]}>
              <SwipeCard profile={nextProfile} />
            </Animated.View>
          )}

          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.cardWrapper, styles.cardTop, cardAnimatedStyle]}>
              <SwipeCard profile={currentProfile}>
                <SwipeStamp type="like" animatedStyle={likeOpacity} />
                <SwipeStamp type="nope" animatedStyle={nopeOpacity} />

                {/* Discovery Tabs — overlaid on card top */}
                <View style={styles.tabBar}>
                  <View style={styles.tabBarInner}>
                    {DISCOVERY_TABS.map((tab) => (
                      <Pressable
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={styles.tabItem}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            activeTab === tab && styles.tabTextActive,
                          ]}
                        >
                          {tab}
                        </Text>
                        {activeTab === tab && <View style={styles.tabIndicator} />}
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Profile Info — overlaid on card bottom */}
                <View style={styles.cardOverlay}>
                  {/* Interest Chips */}
                  {seekingChips.length > 0 && (
                    <View style={styles.chipsRow}>
                      {seekingChips.map((chip, i) => (
                        <View key={i} style={styles.chip}>
                          <Text style={styles.chipText}>{chip}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Name + Age */}
                  <Text style={styles.profileName}>
                    {currentProfile.displayName}
                    {currentProfile.age ? `, ${currentProfile.age}` : ''}
                  </Text>

                  {/* Location */}
                  <XStack alignItems="center" gap={4} marginTop={2}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>Stockholm</Text>
                  </XStack>
                </View>

                {/* Action Buttons — floating at card bottom */}
                <View style={styles.actionRow}>
                  {/* Pass */}
                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.passButton,
                      passPressed && styles.passButtonActive,
                      discovery.isSwiping && styles.buttonDisabled,
                    ]}
                    onPress={handlePassButton}
                    disabled={discovery.isSwiping}
                  >
                    <PassIcon />
                  </Pressable>

                  {/* Super Like */}
                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.superLikeButton,
                      discovery.isSwiping && styles.buttonDisabled,
                    ]}
                    disabled={discovery.isSwiping}
                  >
                    <SuperLikeIcon />
                  </Pressable>

                  {/* Like */}
                  <Pressable
                    style={[styles.actionButton, likePressed && styles.likeButtonActive, discovery.isSwiping && styles.buttonDisabled]}
                    onPress={handleLikeButton}
                    disabled={discovery.isSwiping}
                  >
                    <LinearGradient
                      colors={['#894d0d', '#a76526']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.likeGradient}
                    >
                      <LikeIcon />
                    </LinearGradient>
                  </Pressable>
                </View>
              </SwipeCard>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>

      <MatchAnimation
        visible={matchVisible}
        matchedProfile={matchedProfile}
        onDismiss={() => setMatchVisible(false)}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: SURFACE_CONTAINER,
  },

  // Top Navigation
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 64,
    paddingTop: 8,
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'NotoSerif_700Bold',
    color: COPPER,
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
    color: COPPER,
  },

  // Card Stack
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
  },
  cardTop: {
    zIndex: 3,
  },
  cardBehind1: {
    zIndex: 2,
  },
  cardBehind2: {
    zIndex: 1,
  },

  // Tab Bar (overlaid on card)
  tabBar: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  tabBarInner: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  tabIndicator: {
    height: 2,
    width: 16,
    backgroundColor: COPPER,
    borderRadius: 1,
    marginTop: 4,
  },

  // Card Overlay — profile info
  cardOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    zIndex: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: GHOST_BORDER,
  },
  chipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  profileName: {
    fontSize: 34,
    fontFamily: 'NotoSerif_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  locationIcon: {
    fontSize: 13,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },

  // Action Buttons Row
  actionRow: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  passButton: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#1d1b19',
  },
  passButtonActive: {
    backgroundColor: EMBER,
  },
  passIconText: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  superLikeButton: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: GOLD,
  },
  superLikeIconText: {
    fontSize: 28,
    color: CHARCOAL,
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 9999,
  },
  likeButtonActive: {
    opacity: 0.85,
  },
  likeIconText: {
    fontSize: 26,
    color: '#FFFFFF',
  },
  likeGradient: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Empty state
  refreshButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: WARM_WHITE,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
})
