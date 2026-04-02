/**
 * TilesHub
 *
 * A reusable 2-column masonry grid of clickable tiles.
 * Used as the landing page for the Discover tab (Upptack).
 *
 * Uses react-native StyleSheet (not Tamagui), consistent with BottomNavBar.
 * Icons from @expo/vector-icons MaterialIcons.
 */

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  type ImageSourcePropType,
  ImageBackground,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TileDef {
  id: string
  title: string
  subtitle: string
  /** MaterialIcons icon name */
  icon: string
  /** Route to navigate to on press */
  route: string
  /** Full-width hero tile with image overlay */
  hero?: boolean
  /** require() image for hero background */
  heroImage?: ImageSourcePropType
  /** Small label above the title on hero tiles */
  heroLabel?: string
  /** Full-width banner style (e.g. Veckans Samling) */
  banner?: boolean
  /** Background color for banner tiles */
  bannerBg?: string
  /** Label for the banner CTA button */
  bannerButtonLabel?: string
}

export interface TilesHubProps {
  tiles: TileDef[]
  onTilePress: (route: string) => void
  headerTitle?: string
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const TOKENS = {
  screenBg: '#fff8f6',
  cardBg: '#ffffff',
  surfaceContainer: '#faebe5',
  primaryContainer: '#894D0D',
  outline: '#857467',
  cardRadius: 16,
  gap: 16,
  screenPadding: 24,
  iconCircle: 40,
  shadowColor: 'rgba(33,26,23,0.06)',
  borderColor: 'rgba(216,195,180,0.15)',
} as const

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeroTile({
  tile,
  onPress,
}: {
  tile: TileDef
  onPress: () => void
}) {
  const inner = (
    <>
      {/* Gradient overlay */}
      <View style={heroStyles.overlay} />
      {/* Content at the bottom */}
      <View style={heroStyles.content}>
        <View style={heroStyles.iconRow}>
          <MaterialIcons
            name={tile.icon as any}
            size={20}
            color="#ffffff"
          />
          {tile.heroLabel ? (
            <Text style={heroStyles.label}>{tile.heroLabel}</Text>
          ) : null}
        </View>
        <Text style={heroStyles.title}>{tile.title}</Text>
        <Text style={heroStyles.subtitle}>{tile.subtitle}</Text>
      </View>
    </>
  )

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={heroStyles.wrapper}
      accessibilityRole="button"
      accessibilityLabel={tile.title}
    >
      {tile.heroImage ? (
        <ImageBackground
          source={tile.heroImage}
          style={heroStyles.card}
          imageStyle={{ borderRadius: TOKENS.cardRadius }}
          resizeMode="cover"
        >
          {inner}
        </ImageBackground>
      ) : (
        <View style={[heroStyles.card, heroStyles.fallbackBg]}>
          {inner}
        </View>
      )}
    </TouchableOpacity>
  )
}

function StandardTile({
  tile,
  onPress,
}: {
  tile: TileDef
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={standardStyles.card}
      accessibilityRole="button"
      accessibilityLabel={tile.title}
    >
      <View style={standardStyles.iconCircle}>
        <MaterialIcons
          name={tile.icon as any}
          size={22}
          color={TOKENS.primaryContainer}
        />
      </View>
      <Text style={standardStyles.title}>{tile.title}</Text>
      <Text style={standardStyles.subtitle}>{tile.subtitle}</Text>
    </TouchableOpacity>
  )
}

function BannerTile({
  tile,
  onPress,
}: {
  tile: TileDef
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        bannerStyles.card,
        tile.bannerBg ? { backgroundColor: tile.bannerBg } : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={tile.title}
    >
      <View style={bannerStyles.textColumn}>
        <Text style={bannerStyles.title}>{tile.title}</Text>
        <Text style={bannerStyles.subtitle}>{tile.subtitle}</Text>
      </View>
      {tile.bannerButtonLabel ? (
        <View style={bannerStyles.button}>
          <Text style={bannerStyles.buttonText}>{tile.bannerButtonLabel}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  )
}

// ---------------------------------------------------------------------------
// TilesHub
// ---------------------------------------------------------------------------

export function TilesHub({ tiles, onTilePress }: TilesHubProps) {
  // Separate hero, banner, and standard tiles
  const heroTiles = tiles.filter((t) => t.hero)
  const bannerTiles = tiles.filter((t) => t.banner)
  const standardTiles = tiles.filter((t) => !t.hero && !t.banner)

  // Pair standard tiles into rows of 2
  const rows: TileDef[][] = []
  for (let i = 0; i < standardTiles.length; i += 2) {
    rows.push(standardTiles.slice(i, i + 2))
  }

  return (
    <ScrollView
      style={layoutStyles.scroll}
      contentContainerStyle={layoutStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero tiles (full width) */}
      {heroTiles.map((tile) => (
        <HeroTile
          key={tile.id}
          tile={tile}
          onPress={() => onTilePress(tile.route)}
        />
      ))}

      {/* Standard tiles in 2-column grid */}
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={layoutStyles.row}>
          {row.map((tile) => (
            <StandardTile
              key={tile.id}
              tile={tile}
              onPress={() => onTilePress(tile.route)}
            />
          ))}
          {/* If odd number of tiles, add an empty spacer */}
          {row.length === 1 && <View style={layoutStyles.spacer} />}
        </View>
      ))}

      {/* Banner tiles (full width) */}
      {bannerTiles.map((tile) => (
        <BannerTile
          key={tile.id}
          tile={tile}
          onPress={() => onTilePress(tile.route)}
        />
      ))}
    </ScrollView>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const layoutStyles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: TOKENS.screenBg,
  },
  scrollContent: {
    paddingHorizontal: TOKENS.screenPadding,
    paddingBottom: 120, // space for bottom nav
    gap: TOKENS.gap,
  },
  row: {
    flexDirection: 'row',
    gap: TOKENS.gap,
  },
  spacer: {
    flex: 1,
  },
})

const heroStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  card: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: TOKENS.cardRadius,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    // Shadow
    shadowColor: '#211a17',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  fallbackBg: {
    backgroundColor: '#3d2c1e',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33,26,23,0.55)',
    // Simulated gradient: darker at bottom via a second layer
  },
  content: {
    padding: 20,
    gap: 4,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.80)',
  },
})

const standardStyles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: TOKENS.cardBg,
    borderRadius: TOKENS.cardRadius,
    padding: 16,
    justifyContent: 'flex-end',
    gap: 4,
    // Shadow
    shadowColor: '#211a17',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    // Border
    borderWidth: 1,
    borderColor: TOKENS.borderColor,
  },
  iconCircle: {
    width: TOKENS.iconCircle,
    height: TOKENS.iconCircle,
    borderRadius: TOKENS.iconCircle / 2,
    backgroundColor: TOKENS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#1d1b19',
  },
  subtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: TOKENS.outline,
  },
})

const bannerStyles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: TOKENS.surfaceContainer,
    borderRadius: TOKENS.cardRadius,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Shadow
    shadowColor: '#211a17',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    // Border
    borderWidth: 1,
    borderColor: TOKENS.borderColor,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#1d1b19',
  },
  subtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: TOKENS.outline,
  },
  button: {
    backgroundColor: TOKENS.primaryContainer,
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 12,
  },
  buttonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
})

export default TilesHub
