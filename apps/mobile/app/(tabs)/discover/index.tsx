import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TilesHub, type TileDef } from '@lustre/ui'
import { PolaroidHeader } from '@/components/PolaroidHeader'
import { Bell } from 'phosphor-react-native'

// ---------------------------------------------------------------------------
// Tile configuration (6 tiles from Stitch design)
// ---------------------------------------------------------------------------

const DISCOVER_TILES: TileDef[] = [
  {
    id: 'swipe',
    title: 'Klassisk kortlek',
    subtitle: 'Hitta kemin genom ett svep',
    icon: 'local-fire-department',
    route: 'discover/swipe',
    hero: true,
    heroLabel: 'SWIPE',
    // heroImage: require('@/assets/images/discover-hero.jpg'),
  },
  {
    id: 'intentions',
    title: 'Intentions',
    subtitle: 'Vad söker du?',
    icon: 'explore',
    route: 'discover/intentions',
  },
  {
    id: 'search',
    title: 'Sök & Filtrera',
    subtitle: 'Hitta din match',
    icon: 'search',
    route: 'discover/search',
  },
  {
    id: 'nearby',
    title: 'Nära dig',
    subtitle: 'Upptäck lokalt',
    icon: 'location-on',
    route: 'discover/nearby',
  },
  {
    id: 'trending',
    title: 'Trending',
    subtitle: 'Populära profiler',
    icon: 'auto-awesome',
    route: 'discover/trending',
  },
  {
    id: 'matches',
    title: 'Veckans Samling',
    subtitle: 'Handplockade profiler för dig',
    icon: 'favorite',
    route: 'discover/matches',
    banner: true,
    bannerBg: '#faebe5',
    bannerButtonLabel: 'Öppna',
  },
]

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DiscoverIndexScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleTilePress = useCallback(
    (route: string) => {
      // Routes like "discover/swipe" -> navigate to "./swipe" relative
      const subRoute = route.replace('discover/', '')
      router.push(`/(tabs)/discover/${subRoute}` as any)
    },
    [router]
  )

  const handleNotifications = useCallback(() => {
    // TODO: open notifications
  }, [])

  return (
    <View style={styles.container}>
      <PolaroidHeader
        title="Upptäck"
        rightIcon={Bell}
        onRightPress={handleNotifications}
        rightAccessibilityLabel="Notifikationer"
      />

      {/* Content below header */}
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <TilesHub
          tiles={DISCOVER_TILES}
          onTilePress={handleTilePress}
          headerTitle="Upptäck"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f6',
  },
  content: {
    flex: 1,
  },
})
