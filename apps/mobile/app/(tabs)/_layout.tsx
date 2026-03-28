import { useMemo } from 'react'
import { Tabs } from 'expo-router'
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { Compass, ChatCircle, MagnifyingGlass, BookOpen, User } from 'phosphor-react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useChat } from '@lustre/app/src/hooks/useChat'
import { COLORS, SPACING } from '@/constants/tokens'

// ─── Icon map ────────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, (focused: boolean) => JSX.Element> = {
  discover: (focused) => (
    <Compass
      size={24}
      weight={focused ? 'regular' : 'light'}
      color={focused ? COLORS.copper : COLORS.outline}
    />
  ),
  connect: (focused) => (
    <ChatCircle
      size={24}
      weight={focused ? 'regular' : 'light'}
      color={focused ? COLORS.copper : COLORS.outline}
    />
  ),
  explore: (focused) => (
    <MagnifyingGlass
      size={24}
      weight={focused ? 'regular' : 'light'}
      color={focused ? COLORS.copper : COLORS.outline}
    />
  ),
  learn: (focused) => (
    <BookOpen
      size={24}
      weight={focused ? 'regular' : 'light'}
      color={focused ? COLORS.copper : COLORS.outline}
    />
  ),
  profile: (focused) => (
    <User
      size={24}
      weight={focused ? 'regular' : 'light'}
      color={focused ? COLORS.copper : COLORS.outline}
    />
  ),
}

// ─── FloatingDock ─────────────────────────────────────────────────────────────

function FloatingDock({ state, descriptors, navigation }: BottomTabBarProps) {
  // Only render routes that have not been hidden via href: null
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key] as { options: Record<string, unknown> }
    return options.href !== null
  })

  // Determine active index within the visible subset
  const activeVisibleIndex = visibleRoutes.findIndex(
    (r) => r.key === state.routes[state.index]?.key
  )

  const DockContent = (
    <View style={styles.dockInner}>
      {visibleRoutes.map((route, visibleIndex) => {
        const { options } = descriptors[route.key]
        const isFocused = visibleIndex === activeVisibleIndex
        const routeName = route.name.toLowerCase()
        const renderIcon = TAB_ICONS[routeName]

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
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {renderIcon ? renderIcon(isFocused) : null}
            {/* Active indicator dot */}
            {isFocused && <View style={styles.activeDot} />}
          </TouchableOpacity>
        )
      })}
    </View>
  )

  return (
    <View style={styles.dockContainer} pointerEvents="box-none">
      {Platform.OS === 'android' ? (
        // Android: BlurView blur is unreliable — use solid fallback
        <View style={[styles.blurView, styles.androidFallback]}>
          {DockContent}
        </View>
      ) : (
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          {DockContent}
        </BlurView>
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: SPACING.md,           // 16px from screen edge
    left: SPACING.lg,             // 24px
    right: SPACING.lg,
    alignItems: 'center',
    // Shadow — iOS
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    // Shadow — Android
    elevation: 8,
  },
  blurView: {
    borderRadius: SPACING.xxl,   // 48px
    overflow: 'hidden',
    width: '100%',
  },
  androidFallback: {
    backgroundColor: 'rgba(254,248,243,0.92)',
  },
  dockInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(254,248,243,0.80)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    minHeight: 44, // accessibility touch target
    gap: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.copper,
  },
})

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabLayout() {
  const { totalUnread } = useChat()
  const connectBadge = useMemo(
    () => (totalUnread > 0 ? totalUnread : undefined),
    [totalUnread]
  )

  return (
    <Tabs
      tabBar={(props) => <FloatingDock {...props} />}
      screenOptions={{
        headerShown: false,
        // Ensure content is not hidden behind the floating dock
        sceneStyle: { paddingBottom: 96 },
      }}
    >
      {/* ── Visible tabs ───────────────────────────── */}
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

      {/* ── Hidden routes ──────────────────────────── */}
      <Tabs.Screen name="index"    options={{ href: null }} />
      <Tabs.Screen name="chat"     options={{ href: null }} />
      <Tabs.Screen name="coach"    options={{ href: null }} />
      <Tabs.Screen name="consent"  options={{ href: null }} />
      <Tabs.Screen name="shop"     options={{ href: null }} />
      <Tabs.Screen name="events"   options={{ href: null }} />
      <Tabs.Screen name="groups"   options={{ href: null }} />
      <Tabs.Screen name="orgs"     options={{ href: null }} />
      <Tabs.Screen name="safedate" options={{ href: null }} />
    </Tabs>
  )
}
