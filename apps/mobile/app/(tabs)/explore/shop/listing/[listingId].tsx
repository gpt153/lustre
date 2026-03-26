import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, Button, XStack, Text } from 'tamagui'
import { ListingDetailScreen } from '@lustre/app/src/screens/ListingDetailScreen'

export default function ShopListingRoute() {
  const router = useRouter()
  const { listingId } = useLocalSearchParams<{ listingId: string }>()

  if (!listingId) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$gray10">Annonsen hittades inte</Text>
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
          onPress={() => router.back()}
          unstyled
          padding="$0"
        >
          <Text fontSize={18} color="$pink8">
            ← Tillbaka
          </Text>
        </Button>
        <Text fontSize={16} fontWeight="600" color="$color">
          Annons
        </Text>
        <YStack width={40} />
      </XStack>

      <ListingDetailScreen
        listingId={listingId}
        onBuySuccess={(orderId) => {
          router.push(`/(tabs)/explore/shop/order/${orderId}`)
        }}
        onClose={() => router.back()}
      />
    </YStack>
  )
}
