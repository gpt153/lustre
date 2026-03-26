import { useMemo } from 'react'
import { Tabs } from 'expo-router'
import { useChat } from '@lustre/app/src/hooks/useChat'

export default function TabLayout() {
  const { totalUnread } = useChat()
  const connectBadge = useMemo(() => totalUnread > 0 ? totalUnread : undefined, [totalUnread])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#B87333',
        tabBarInactiveTintColor: '#8B7E74',
        headerStyle: { backgroundColor: '#2C2421' },
        headerTintColor: '#F5EDE4',
        tabBarStyle: { backgroundColor: '#FDF8F3', borderTopColor: '#C4956A' },
      }}
    >
      <Tabs.Screen name="discover" options={{ title: 'Discover', headerShown: false }} />
      <Tabs.Screen name="connect" options={{ title: 'Connect', headerShown: false, tabBarBadge: connectBadge }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', headerShown: false }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn', headerShown: false }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: false }} />
    </Tabs>
  )
}
