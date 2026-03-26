import { Stack } from 'expo-router'

export default function LearnCoachLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2C2421' },
        headerTintColor: '#F5EDE4',
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="start" />
      <Stack.Screen name="session" />
    </Stack>
  )
}
