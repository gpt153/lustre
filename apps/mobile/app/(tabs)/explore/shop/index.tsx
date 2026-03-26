import { useRouter } from 'expo-router'
import { MarketplaceListScreen } from '@lustre/app/src/screens/MarketplaceListScreen'

export default function ShopIndexScreen() {
  const router = useRouter()

  return (
    <MarketplaceListScreen
      onListingPress={(listingId) => router.push(`/(tabs)/explore/shop/listing/${listingId}`)}
      onCreatePress={() => router.push('/(tabs)/explore/shop/create')}
    />
  )
}
