import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, Button, XStack, Text } from 'tamagui'
import { OrderStatusScreen } from '@lustre/app/src/screens/OrderStatusScreen'

export default function ShopOrderRoute() {
  const router = useRouter()
  const { orderId } = useLocalSearchParams<{ orderId: string }>()

  if (!orderId) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$gray10">Beställningen hittades inte</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        padding="$4"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Button
          onPress={() => router.push('/(tabs)/explore/shop')}
          unstyled
          padding="$0"
        >
          <Text fontSize={18} color="$pink8">
            ← Tillbaka
          </Text>
        </Button>
        <Text fontSize={16} fontWeight="600" color="$color">
          Orderstatus
        </Text>
        <YStack width={40} />
      </XStack>

      <OrderStatusScreen
        orderId={orderId}
        onConfirmDelivery={() => {
          router.push('/(tabs)/explore/shop')
        }}
      />
    </YStack>
  )
}
