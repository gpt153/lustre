import { Stack } from 'expo-router'

const HEADER_DEFAULTS = {
  headerStyle: { backgroundColor: '#fff8f6' },
  headerTintColor: '#894D0D',
  headerShadowVisible: false,
  headerBackTitle: 'Tillbaka',
}

export default function CommunityLayout() {
  return (
    <Stack screenOptions={HEADER_DEFAULTS}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="feed" options={{ title: 'Flöde', headerShown: true }} />
      <Stack.Screen name="groups" options={{ title: 'Grupper', headerShown: true }} />
      <Stack.Screen name="events" options={{ title: 'Event', headerShown: true }} />
      <Stack.Screen name="orgs" options={{ title: 'Organisationer', headerShown: true }} />
      <Stack.Screen name="kudos" options={{ title: 'Kudos', headerShown: true }} />
    </Stack>
  )
}
