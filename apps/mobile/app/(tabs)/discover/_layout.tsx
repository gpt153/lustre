import { Stack } from 'expo-router'

export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fef8f3' },
        headerTintColor: '#1d1b19',
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ title: 'Sök', headerShown: true }} />
    </Stack>
  )
}
