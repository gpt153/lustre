import React, { useMemo } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'

let BlurView: React.ComponentType<any> | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BlurView = require('expo-blur').BlurView
} catch {
  // BlurView not available — will use solid fallback
}

/* ─── Design tokens (from Stitch) ─── */
const COLORS = {
  active: '#894D0D',        // primary-container
  inactive: '#857467',      // outline
  bgIOS: 'rgba(255,241,235,0.80)',
  bgAndroid: 'rgba(255,241,235,0.92)',
  topBorder: 'rgba(216,195,180,0.30)',
  shadowColor: '#211a17',
} as const

const BAR_HEIGHT = 80
const ICON_SIZE = 24
const DOT_SIZE = 4
const CORNER_RADIUS = 24
const MIN_TOUCH = 44

/* ─── Tab config ─── */
type TabIcon = React.ComponentProps<typeof MaterialIcons>['name']

interface TabDef {
  routeName: string
  icon: TabIcon
  iconOutline: TabIcon
  label: string
  isFABSlot?: boolean
}

const VISIBLE_TABS: TabDef[] = [
  { routeName: 'discover',       icon: 'explore',            iconOutline: 'explore',              label: 'Upptäck' },
  { routeName: 'community',      icon: 'group',              iconOutline: 'group',                label: 'Community' },
  { routeName: 'center-action',  icon: 'add',                iconOutline: 'add',                  label: '',     isFABSlot: true },
  { routeName: 'chat',           icon: 'chat-bubble',        iconOutline: 'chat-bubble-outline',  label: 'Chatt' },
  { routeName: 'profile',        icon: 'person',             iconOutline: 'person-outline',       label: 'Jag' },
]

/* ─── Props ─── */
export interface BottomNavBarProps extends BottomTabBarProps {
  centerFAB?: React.ReactNode
}

/* ─── Component ─── */
export function BottomNavBar({ state, descriptors, navigation, centerFAB }: BottomNavBarProps) {
  const insets = useSafeAreaInsets()
  const totalHeight = BAR_HEIGHT + insets.bottom

  // Build a lookup from route name → route object + actual state index
  const routeMap = useMemo(() => {
    const map = new Map<string, { route: typeof state.routes[number]; stateIndex: number }>()
    state.routes.forEach((route, idx) => {
      map.set(route.name, { route, stateIndex: idx })
    })
    return map
  }, [state.routes])

  const renderTabs = () =>
    VISIBLE_TABS.map((tabDef) => {
      // Center FAB slot
      if (tabDef.isFABSlot) {
        return (
          <View key="center-slot" style={styles.centerSlot}>
            {centerFAB}
          </View>
        )
      }

      const entry = routeMap.get(tabDef.routeName)
      if (!entry) return null

      const { route, stateIndex } = entry
      const isFocused = state.index === stateIndex
      const { options } = descriptors[route.key]

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        })
        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params)
        }
      }

      const onLongPress = () => {
        navigation.emit({
          type: 'tabLongPress',
          target: route.key,
        })
      }

      const color = isFocused ? COLORS.active : COLORS.inactive
      const iconName = isFocused ? tabDef.icon : tabDef.iconOutline

      return (
        <TouchableOpacity
          key={route.key}
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel ?? tabDef.label}
          testID={options.tabBarTestID}
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.tab}
          activeOpacity={0.7}
        >
          <MaterialIcons name={iconName} size={ICON_SIZE} color={color} />
          {tabDef.label ? (
            <Text numberOfLines={1} style={[styles.label, { color }]}>{tabDef.label}</Text>
          ) : null}
          {isFocused && <View style={styles.dot} />}
        </TouchableOpacity>
      )
    })

  const innerContent = (
    <View style={[styles.inner, { paddingBottom: insets.bottom }]}>
      {renderTabs()}
    </View>
  )

  const useBlur = Platform.OS === 'ios' && BlurView != null

  return (
    <View style={[styles.outerShadow, { height: totalHeight }]}>
      {useBlur ? (
        <BlurView
          intensity={40}
          tint="light"
          style={[styles.barContainer, { height: totalHeight }]}
        >
          <View style={[styles.blurOverlay, { height: totalHeight }]}>
            {innerContent}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.barContainer, styles.solidBg, { height: totalHeight }]}>
          {innerContent}
        </View>
      )}
    </View>
  )
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  outerShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 12,
  },

  barContainer: {
    borderTopLeftRadius: CORNER_RADIUS,
    borderTopRightRadius: CORNER_RADIUS,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: COLORS.topBorder,
  },

  solidBg: {
    backgroundColor: COLORS.bgAndroid,
  },

  blurOverlay: {
    backgroundColor: COLORS.bgIOS,
  },

  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: BAR_HEIGHT,
    paddingHorizontal: 0,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH,
    paddingVertical: 8,
  },

  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH,
  },

  label: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0,
    marginTop: 2,
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLORS.active,
    marginTop: 4,
  },
})
