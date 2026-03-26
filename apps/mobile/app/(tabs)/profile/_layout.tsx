import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2C2421' },
        headerTintColor: '#F5EDE4',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profile', headerShown: true }} />
      <Stack.Screen name="gatekeeper" options={{ title: 'Gatekeeper', headerShown: true }} />
      <Stack.Screen name="spicy-settings" options={{ title: 'Spicy Mode', headerShown: true }} />
      <Stack.Screen name="safedate" options={{ title: 'SafeDate', headerShown: true }} />
      <Stack.Screen name="vault" options={{ title: 'Consent Vault', headerShown: true }} />
    </Stack>
  )
}
