import { useMemo, useCallback } from 'react'
import { Tabs } from 'expo-router'
import { BottomNavBar, CenterFAB } from '@lustre/ui'
import { useChat } from '@lustre/app/src/hooks/useChat'

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function TabLayout() {
  const { totalUnread } = useChat()
  const chatBadge = useMemo(
    () => (totalUnread > 0 ? totalUnread : undefined),
    [totalUnread]
  )

  const handleFABPress = useCallback(() => {
    // TODO: Open QuickCreateMenu (Wave 3)
    console.log('[CenterFAB] pressed — QuickCreateMenu coming in Wave 3')
  }, [])

  return (
    <Tabs
      tabBar={(props) => (
        <BottomNavBar {...props} centerFAB={<CenterFAB onPress={handleFABPress} />} />
      )}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#fff8f6' },
      }}
    >
      {/* ── Visible tabs (order matters: 0=discover, 1=community, 2=center-action, 3=chat, 4=profile) ── */}
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Upptäck',
          tabBarAccessibilityLabel: 'Upptäck',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarAccessibilityLabel: 'Community',
        }}
      />
      <Tabs.Screen
        name="center-action"
        options={{
          title: '',
          tabBarAccessibilityLabel: 'Skapa nytt',
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent navigation — the CenterFAB handles the action
            e.preventDefault()
          },
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chatt',
          tabBarAccessibilityLabel: 'Chatt',
          tabBarBadge: chatBadge,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Jag',
          tabBarAccessibilityLabel: 'Jag',
        }}
      />

      {/* ── Hidden routes (accessible via navigation but not shown in tab bar) ── */}
      <Tabs.Screen name="index"          options={{ href: null }} />
      <Tabs.Screen name="connect"        options={{ href: null }} />
      <Tabs.Screen name="explore"        options={{ href: null }} />
      <Tabs.Screen name="learn"          options={{ href: null }} />
      <Tabs.Screen name="coach"          options={{ href: null }} />
      <Tabs.Screen name="consent"        options={{ href: null }} />
      <Tabs.Screen name="shop"           options={{ href: null }} />
      <Tabs.Screen name="events"         options={{ href: null }} />
      <Tabs.Screen name="groups"         options={{ href: null }} />
      <Tabs.Screen name="orgs"           options={{ href: null }} />
      <Tabs.Screen name="safedate"       options={{ href: null }} />
      <Tabs.Screen name="polaroid-test"  options={{ href: null }} />
    </Tabs>
  )
}
