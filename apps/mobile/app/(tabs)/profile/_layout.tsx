import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fef8f3' },
        headerTintColor: '#1d1b19',
        headerShadowVisible: false,
        headerBackTitle: 'Tillbaka',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profil', headerShown: false }} />
      <Stack.Screen name="gatekeeper" options={{ title: 'Gatekeeper' }} />
      <Stack.Screen name="spicy-settings" options={{ title: 'Spicy-läge' }} />
      <Stack.Screen name="safedate" options={{ title: 'SafeDate' }} />
      <Stack.Screen name="vault" options={{ title: 'Consent Vault' }} />
    </Stack>
  )
}
