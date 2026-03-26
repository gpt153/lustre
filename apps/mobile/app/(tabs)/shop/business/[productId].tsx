import { useLocalSearchParams } from 'expo-router'
import { BusinessProductDetailScreen } from '@lustre/app/src/screens/BusinessProductDetailScreen'

export default function BusinessProductPage() {
  const { productId } = useLocalSearchParams<{ productId: string }>()

  return <BusinessProductDetailScreen productId={productId} />
}
