import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TilesHub, type TileDef } from '@lustre/ui'
import { PolaroidHeader } from '@/components/PolaroidHeader'
import { MagnifyingGlass } from 'phosphor-react-native'

// ---------------------------------------------------------------------------
// Tile configuration (5 tiles from Stitch design)
// ---------------------------------------------------------------------------

const COMMUNITY_TILES: TileDef[] = [
  {
    id: 'feed',
    title: 'Flöde',
    subtitle: 'Senaste från communityn',
    icon: 'dynamic-feed',
    route: 'community/feed',
    hero: true,
    heroLabel: 'FLÖDE',
  },
  {
    id: 'groups',
    title: 'Grupper',
    subtitle: 'Hitta din community',
    icon: 'group',
    route: 'community/groups',
  },
  {
    id: 'events',
    title: 'Event',
    subtitle: 'Vad händer?',
    icon: 'event',
    route: 'community/events',
  },
  {
    id: 'orgs',
    title: 'Organisationer',
    subtitle: 'Föreningar & klubbar',
    icon: 'corporate-fare',
    route: 'community/orgs',
  },
  {
    id: 'kudos',
    title: 'Kudos',
    subtitle: 'Ge & få uppskattning',
    icon: 'volunteer-activism',
    route: 'community/kudos',
  },
]

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function CommunityIndexScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleTilePress = useCallback(
    (route: string) => {
      const subRoute = route.replace('community/', '')
      router.push(`/(tabs)/community/${subRoute}` as any)
    },
    [router]
  )

  const handleSearch = useCallback(() => {
    // TODO: open community search
  }, [])

  return (
    <View style={styles.container}>
      <PolaroidHeader
        title="Community"
        rightIcon={MagnifyingGlass}
        onRightPress={handleSearch}
        rightAccessibilityLabel="Sök"
      />

      {/* Content below header */}
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <TilesHub
          tiles={COMMUNITY_TILES}
          onTilePress={handleTilePress}
          headerTitle="Community"
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
