import { Stack } from 'expo-router'

export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2C2421' },
        headerTintColor: '#F5EDE4',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Discover', headerShown: true }} />
      <Stack.Screen name="search" options={{ title: 'Search', headerShown: true }} />
    </Stack>
  )
}
