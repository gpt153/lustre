import { Stack } from 'expo-router'

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2C2421' },
        headerTintColor: '#F5EDE4',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Explore', headerShown: true }} />
      <Stack.Screen name="groups" options={{ title: 'Groups', headerShown: true }} />
      <Stack.Screen name="events" options={{ title: 'Events', headerShown: true }} />
      <Stack.Screen name="orgs" options={{ title: 'Organizations', headerShown: true }} />
      <Stack.Screen name="shop" options={{ title: 'Shop', headerShown: false }} />
    </Stack>
  )
}
