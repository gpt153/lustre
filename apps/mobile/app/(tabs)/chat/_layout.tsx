import { Stack } from 'expo-router'

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FDF8F3' },
        animation: 'slide_from_right',
      }}
    />
  )
}
