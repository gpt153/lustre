import { Stack } from 'expo-router'

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="listing/[listingId]"
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="order/[orderId]"
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="business/_layout"
        options={{
          animationEnabled: true,
        }}
      />
    </Stack>
  )
}
