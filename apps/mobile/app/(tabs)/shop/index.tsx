import { useRouter } from 'expo-router'
import { MarketplaceListScreen } from '@lustre/app/src/screens/MarketplaceListScreen'

export default function ShopTab() {
  const router = useRouter()

  return (
    <MarketplaceListScreen
      onListingPress={(listingId) => router.push(`/(tabs)/shop/listing/${listingId}`)}
      onCreatePress={() => router.push('/(tabs)/shop/create')}
    />
  )
}
