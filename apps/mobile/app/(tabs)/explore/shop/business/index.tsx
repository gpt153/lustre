import { useRouter } from 'expo-router'
import { BusinessShopScreen } from '@lustre/app/src/screens/BusinessShopScreen'

export default function BusinessShopScreen_() {
  const router = useRouter()

  return (
    <BusinessShopScreen
      onProductPress={(productId) =>
        router.push(`/(tabs)/explore/shop/business/${productId}`)
      }
    />
  )
}
