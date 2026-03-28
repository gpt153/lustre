import { useState } from 'react'
import { ScrollView, Alert } from 'react-native'
import { YStack, XStack, Text, Spinner, Button, Image } from 'tamagui'
import { useProduct, useAddToCart } from '../hooks/useShop'

interface BusinessProductDetailScreenProps {
  productId: string
}

export function BusinessProductDetailScreen({ productId }: BusinessProductDetailScreenProps) {
  const { data: product, isLoading } = useProduct(productId)
  const addToCart = useAddToCart()
  const [selectedImage, setSelectedImage] = useState(0)

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!product) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$xl">
        <Text color="$textSecondary">Produkten hittades inte</Text>
      </YStack>
    )
  }

  const variant = product.variants?.[0]
  const priceAmount = variant?.calculated_price?.calculated_amount
  const price = priceAmount !== undefined ? `${Math.round(priceAmount / 100)} kr` : 'Pris saknas'
  const images = product.images ?? []
  const currentImage = images[selectedImage]?.url ?? product.thumbnail

  const handleAddToCart = () => {
    if (!variant) {
      Alert.alert('Fel', 'Ingen variant tillgänglig')
      return
    }
    addToCart.mutate(
      { variantId: variant.id, quantity: 1 },
      {
        onSuccess: () => Alert.alert('Tillagd!', 'Produkten lades i varukorgen'),
        onError: () => Alert.alert('Fel', 'Kunde inte lägga till i varukorg'),
      },
    )
  }

  return (
    <ScrollView>
      <YStack>
        {currentImage ? (
          <Image source={{ uri: currentImage }} width="100%" height={300} resizeMode="cover" />
        ) : (
          <YStack width="100%" height={300} backgroundColor="$backgroundHover" />
        )}

        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 8 }}>
            <XStack gap="$xs">
              {images.map((img, index) => (
                <YStack
                  key={img.id}
                  onPress={() => setSelectedImage(index)}
                  borderWidth={selectedImage === index ? 2 : 1}
                  borderColor={selectedImage === index ? '$primary' : '$borderColor'}
                  borderRadius="$2"
                  overflow="hidden"
                >
                  <Image
                    source={{ uri: img.url }}
                    width={72}
                    height={72}
                    resizeMode="cover"
                  />
                </YStack>
              ))}
            </XStack>
          </ScrollView>
        )}

        <YStack padding="$md" gap="$sm">
          <Text fontSize="$6" fontWeight="700" color="$text">
            {product.title}
          </Text>
          <Text fontSize="$5" fontWeight="700" color="$primary">
            {price}
          </Text>
          {product.description && (
            <Text color="$textSecondary" lineHeight="$5">
              {product.description}
            </Text>
          )}
          <Button
            backgroundColor="$primary"
            borderRadius="$3"
            onPress={handleAddToCart}
            disabled={addToCart.isPending || !variant}
          >
            <Text color="white" fontWeight="700">
              {addToCart.isPending ? 'Lägger till...' : 'Lägg i varukorg'}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
