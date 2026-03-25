import { useMemo } from 'react'
import { Tabs } from 'expo-router'
import { useChat } from '@lustre/app/src/hooks/useChat'

export default function TabLayout() {
  const { totalUnread } = useChat()

  const chatTabBadge = useMemo(() => {
    return totalUnread > 0 ? totalUnread : null
  }, [totalUnread])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E91E63',
        headerStyle: { backgroundColor: '#E91E63' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
      <Tabs.Screen name="events" options={{ title: 'Events' }} />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarBadge: chatTabBadge,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}
