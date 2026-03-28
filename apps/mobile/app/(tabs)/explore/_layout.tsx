import { Stack } from 'expo-router'

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fef8f3' },
        headerTintColor: '#1d1b19',
        headerShadowVisible: false,
        headerBackTitle: 'Tillbaka',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Utforska', headerShown: false }} />
      <Stack.Screen name="groups" options={{ title: 'Grupper' }} />
      <Stack.Screen name="events" options={{ title: 'Evenemang' }} />
      <Stack.Screen name="orgs" options={{ title: 'Organisationer' }} />
      <Stack.Screen name="shop" options={{ title: 'Shop', headerShown: false }} />
    </Stack>
  )
}
