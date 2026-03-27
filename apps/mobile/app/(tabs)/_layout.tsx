import { useMemo } from 'react'
import { Tabs } from 'expo-router'
import { Compass, ChatCircle, MagnifyingGlass, BookOpen, User } from 'phosphor-react-native'
import { useChat } from '@lustre/app/src/hooks/useChat'
import { COLORS, SPACING } from '@/constants/tokens'

export default function TabLayout() {
  const { totalUnread } = useChat()
  const connectBadge = useMemo(() => totalUnread > 0 ? totalUnread : undefined, [totalUnread])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.copper,
        tabBarInactiveTintColor: COLORS.warmGray,
        headerStyle: { backgroundColor: COLORS.charcoal },
        headerTintColor: COLORS.warmCream,
        tabBarStyle: {
          backgroundColor: COLORS.warmWhite,
          borderTopColor: COLORS.copperMuted,
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          headerShown: false,
          tabBarAccessibilityLabel: 'Discover tab',
          tabBarIcon: ({ focused }) => (
            <Compass
              size={24}
              weight={focused ? 'fill' : 'regular'}
              color={focused ? COLORS.copper : COLORS.warmGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          headerShown: false,
          tabBarBadge: connectBadge,
          tabBarAccessibilityLabel: 'Connect tab',
          tabBarIcon: ({ focused }) => (
            <ChatCircle
              size={24}
              weight={focused ? 'fill' : 'regular'}
              color={focused ? COLORS.copper : COLORS.warmGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
          tabBarAccessibilityLabel: 'Explore tab',
          tabBarIcon: ({ focused }) => (
            <MagnifyingGlass
              size={24}
              weight={focused ? 'fill' : 'regular'}
              color={focused ? COLORS.copper : COLORS.warmGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          headerShown: false,
          tabBarAccessibilityLabel: 'Learn tab',
          tabBarIcon: ({ focused }) => (
            <BookOpen
              size={24}
              weight={focused ? 'fill' : 'regular'}
              color={focused ? COLORS.copper : COLORS.warmGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ focused }) => (
            <User
              size={24}
              weight={focused ? 'fill' : 'regular'}
              color={focused ? COLORS.copper : COLORS.warmGray}
            />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="coach" options={{ href: null }} />
      <Tabs.Screen name="consent" options={{ href: null }} />
      <Tabs.Screen name="shop" options={{ href: null }} />
      <Tabs.Screen name="events" options={{ href: null }} />
      <Tabs.Screen name="groups" options={{ href: null }} />
      <Tabs.Screen name="orgs" options={{ href: null }} />
      <Tabs.Screen name="safedate" options={{ href: null }} />
    </Tabs>
  )
}
