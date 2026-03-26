import { Stack } from 'expo-router'

export default function BusinessShopLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[productId]"
        options={{ animationEnabled: true }}
      />
    </Stack>
  )
}
