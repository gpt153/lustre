import { Stack } from 'expo-router'

export default function ConnectLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2C2421' },
        headerTintColor: '#F5EDE4',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Chat', headerShown: true }} />
      <Stack.Screen name="[conversationId]" options={{ title: 'Chat', headerShown: true }} />
      <Stack.Screen name="matches" options={{ title: 'Matches', headerShown: true }} />
    </Stack>
  )
}
