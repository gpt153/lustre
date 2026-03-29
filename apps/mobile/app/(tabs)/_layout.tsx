import { useMemo } from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { Compass, ChatCircle, MagnifyingGlass, BookOpen, User } from 'phosphor-react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useChat } from '@lustre/app/src/hooks/useChat'
import { COLORS, SPACING } from '@/constants/tokens'

// ─── Design tokens ───────────────────────────────────────────────────────────

const NAV_TOKENS = {
  bg: 'rgba(255,248,246,0.80)',
  bgAndroid: 'rgba(255,248,246,0.92)',
  ghostBorder: 'rgba(216,195,180,0.10)',
  activeColor: '#894d0d',
  inactiveColor: 'rgba(33,26,23,0.40)',
  shadowColor: '#211a17',
  borderRadius: 32,
  labelSize: 10,
  labelSpacing: 2,
  iconSize: 24,
  activeScale: 1.1,
  dotSize: 4,
} as const

// ─── Icon map ────────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, (focused: boolean) => JSX.Element> = {
  discover: (focused) => (
    <Compass
      size={NAV_TOKENS.iconSize}
      weight={focused ? 'fill' : 'light'}
      color={focused ? NAV_TOKENS.activeColor : NAV_TOKENS.inactiveColor}
    />
  ),
  connect: (focused) => (
    <ChatCircle
      size={NAV_TOKENS.iconSize}
      weight={focused ? 'fill' : 'light'}
      color={focused ? NAV_TOKENS.activeColor : NAV_TOKENS.inactiveColor}
    />
  ),
  explore: (focused) => (
    <MagnifyingGlass
      size={NAV_TOKENS.iconSize}
      weight={focused ? 'fill' : 'light'}
      color={focused ? NAV_TOKENS.activeColor : NAV_TOKENS.inactiveColor}
    />
  ),
  learn: (focused) => (
    <BookOpen
      size={NAV_TOKENS.iconSize}
      weight={focused ? 'fill' : 'light'}
      color={focused ? NAV_TOKENS.activeColor : NAV_TOKENS.inactiveColor}
    />
  ),
  profile: (focused) => (
    <User
      size={NAV_TOKENS.iconSize}
      weight={focused ? 'fill' : 'light'}
      color={focused ? NAV_TOKENS.activeColor : NAV_TOKENS.inactiveColor}
    />
  ),
}

// ─── Tab labels ──────────────────────────────────────────────────────────────

const TAB_LABELS: Record<string, string> = {
  discover: 'DISCOVER',
  connect: 'CONNECT',
  explore: 'EXPLORE',
  learn: 'LEARN',
  profile: 'PROFILE',
}

// ─── PolaroidTabBar ──────────────────────────────────────────────────────────

function PolaroidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  // Only render routes that have not been hidden via href: null
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key] as { options: Record<string, unknown> }
    return options.href !== null
  })

  // Determine active index within the visible subset
  const activeVisibleIndex = visibleRoutes.findIndex(
    (r) => r.key === state.routes[state.index]?.key
  )

  const TabContent = (
    <View style={[styles.tabInner, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {visibleRoutes.map((route, visibleIndex) => {
        const { options } = descriptors[route.key]
        const isFocused = visibleIndex === activeVisibleIndex
        const routeName = route.name.toLowerCase()
        const renderIcon = TAB_ICONS[routeName]
        const label = TAB_LABELS[routeName] || route.name.toUpperCase()

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          })
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title ?? route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabButton,
              isFocused && styles.tabButtonActive,
            ]}
            activeOpacity={0.7}
          >
            {/* Active dot indicator above icon */}
            {isFocused && <View style={styles.activeDot} />}

            {/* Icon */}
            {renderIcon ? renderIcon(isFocused) : null}

            {/* Label */}
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )

  return (
    <View style={styles.navContainer} pointerEvents="box-none">
      {Platform.OS === 'android' ? (
        // Android: BlurView is unreliable — use solid fallback
        <View style={[styles.navBar, styles.androidFallback]}>
          {TabContent}
        </View>
      ) : (
        <BlurView intensity={80} tint="light" style={styles.navBar}>
          {TabContent}
        </BlurView>
      )}
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Warm shadow upward
    shadowColor: NAV_TOKENS.shadowColor,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    // Android elevation
    elevation: 12,
  },
  navBar: {
    borderTopLeftRadius: NAV_TOKENS.borderRadius,
    borderTopRightRadius: NAV_TOKENS.borderRadius,
    overflow: 'hidden',
    // Ghost border top
    borderTopWidth: 1,
    borderTopColor: NAV_TOKENS.ghostBorder,
  },
  androidFallback: {
    backgroundColor: NAV_TOKENS.bgAndroid,
  },
  tabInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: SPACING.sm,
    backgroundColor: NAV_TOKENS.bg,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 44, // accessibility touch target
    gap: 3,
  },
  tabButtonActive: {
    transform: [{ scale: NAV_TOKENS.activeScale }],
  },
  tabLabel: {
    fontSize: NAV_TOKENS.labelSize,
    letterSpacing: NAV_TOKENS.labelSpacing,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: NAV_TOKENS.activeColor,
  },
  tabLabelInactive: {
    color: NAV_TOKENS.inactiveColor,
  },
  activeDot: {
    width: NAV_TOKENS.dotSize,
    height: NAV_TOKENS.dotSize,
    borderRadius: NAV_TOKENS.dotSize / 2,
    backgroundColor: NAV_TOKENS.activeColor,
    marginBottom: 2,
  },
})

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function TabLayout() {
  const { totalUnread } = useChat()
  const connectBadge = useMemo(
    () => (totalUnread > 0 ? totalUnread : undefined),
    [totalUnread]
  )

  return (
    <Tabs
      tabBar={(props) => <PolaroidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Ensure content is not hidden behind the bottom nav
        sceneStyle: { paddingBottom: 96, backgroundColor: '#FDF8F3' },
      }}
    >
      {/* -- Visible tabs ----------------------------- */}
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarAccessibilityLabel: 'Discover tab',
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          tabBarAccessibilityLabel: 'Connect tab',
          tabBarBadge: connectBadge,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarAccessibilityLabel: 'Explore tab',
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarAccessibilityLabel: 'Learn tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />

      {/* -- Hidden routes ----------------------------- */}
      <Tabs.Screen name="index"    options={{ href: null }} />
      <Tabs.Screen name="chat"     options={{ href: null }} />
      <Tabs.Screen name="coach"    options={{ href: null }} />
      <Tabs.Screen name="consent"  options={{ href: null }} />
      <Tabs.Screen name="shop"     options={{ href: null }} />
      <Tabs.Screen name="events"   options={{ href: null }} />
      <Tabs.Screen name="groups"   options={{ href: null }} />
      <Tabs.Screen name="orgs"     options={{ href: null }} />
      <Tabs.Screen name="safedate" options={{ href: null }} />
      <Tabs.Screen name="polaroid-test" options={{ href: null }} />
    </Tabs>
  )
}
