import { useState } from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import { YStack, XStack, Text, Spinner, Image } from 'tamagui'
import { useProducts } from '../hooks/useShop'

interface BusinessShopScreenProps {
  onProductPress: (productId: string) => void
}

interface ProductCardProps {
  id: string
  title: string
  thumbnail: string | null
  price: string
  onPress: () => void
}

function ProductCard({ title, thumbnail, price, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, margin: 8 }}>
      <YStack
        backgroundColor="$background"
        borderRadius="$3"
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderColor"
        gap="$0"
      >
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            width="100%"
            height={160}
            resizeMode="cover"
          />
        ) : (
          <YStack width="100%" height={160} backgroundColor="$backgroundHover" />
        )}
        <YStack padding="$3" gap="$1">
          <Text fontWeight="700" color="$text" numberOfLines={2}>
            {title}
          </Text>
          <Text fontWeight="700" color="$primary" fontSize="$4">
            {price}
          </Text>
        </YStack>
      </YStack>
    </TouchableOpacity>
  )
}

export function BusinessShopScreen({ onProductPress }: BusinessShopScreenProps) {
  const [search, setSearch] = useState<string | undefined>(undefined)
  const { data, isLoading } = useProducts({ q: search })

  const products = data?.products ?? []

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (products.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8">
        <Text color="$textSecondary" fontSize="$4">
          Inga produkter ännu
        </Text>
      </YStack>
    )
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={{ padding: 8 }}
      renderItem={({ item }) => {
        const variant = item.variants?.[0]
        const priceAmount = variant?.calculated_price?.calculated_amount
        const price = priceAmount !== undefined ? `${Math.round(priceAmount / 100)} kr` : 'Pris saknas'

        return (
          <ProductCard
            id={item.id}
            title={item.title}
            thumbnail={item.thumbnail}
            price={price}
            onPress={() => onProductPress(item.id)}
          />
        )
      }}
    />
  )
}
