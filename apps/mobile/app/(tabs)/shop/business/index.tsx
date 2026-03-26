import { useRouter } from 'expo-router'
import { BusinessShopScreen } from '@lustre/app/src/screens/BusinessShopScreen'

export default function BusinessShopTab() {
  const router = useRouter()

  return (
    <BusinessShopScreen
      onProductPress={(productId) =>
        router.push(`/(tabs)/shop/business/${productId}`)
      }
    />
  )
}
