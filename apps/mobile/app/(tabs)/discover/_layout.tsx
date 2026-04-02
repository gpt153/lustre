import { Stack } from 'expo-router'

const HEADER_DEFAULTS = {
  headerStyle: { backgroundColor: '#fff8f6' },
  headerTintColor: '#894D0D',
  headerShadowVisible: false,
  headerBackTitle: 'Tillbaka',
}

export default function DiscoverLayout() {
  return (
    <Stack screenOptions={HEADER_DEFAULTS}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="swipe" options={{ title: 'Swipe', headerShown: true }} />
      <Stack.Screen name="intentions" options={{ title: 'Intentioner', headerShown: true }} />
      <Stack.Screen name="search" options={{ title: 'Sök', headerShown: true }} />
      <Stack.Screen name="nearby" options={{ title: 'Nära dig', headerShown: true }} />
      <Stack.Screen name="trending" options={{ title: 'Trending', headerShown: true }} />
      <Stack.Screen name="matches" options={{ title: 'Matchningar', headerShown: true }} />
    </Stack>
  )
}
