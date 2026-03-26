'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { useProduct, useAddToCart } from '@lustre/app/src/hooks/useShop'

export default function BusinessProductPage() {
  const params = useParams<{ productId: string }>()
  const { data: product, isLoading } = useProduct(params.productId)
  const addToCart = useAddToCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="60vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!product) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8">
        <Text color="$textSecondary">Produkten hittades inte</Text>
      </YStack>
    )
  }

  const variant = product.variants?.[0]
  const priceAmount = variant?.calculated_price?.calculated_amount
  const price = priceAmount !== undefined ? `${Math.round(priceAmount / 100)} kr` : 'Pris saknas'
  const images = product.images ?? []
  const currentImageUrl = images[selectedImage]?.url ?? product.thumbnail

  const handleAddToCart = () => {
    if (!variant) return
    addToCart.mutate(
      { variantId: variant.id, quantity: 1 },
      {
        onSuccess: () => setAdded(true),
        onError: () => alert('Kunde inte lägga till i varukorg'),
      },
    )
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={900} gap="$6">
        <XStack gap="$6" flexWrap="wrap">
          <YStack flex={1} minWidth={300} gap="$3">
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: '#E0E0E0',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {currentImageUrl && (
                <img
                  src={currentImageUrl}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            {images.length > 1 && (
              <XStack gap="$2" flexWrap="wrap">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: `2px solid ${selectedImage === index ? '#9b59b6' : '#ddd'}`,
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </XStack>
            )}
          </YStack>

          <YStack flex={1} minWidth={280} gap="$4">
            <Text fontSize="$7" fontWeight="700" color="$text">
              {product.title}
            </Text>
            <Text fontSize="$6" fontWeight="700" color="$primary">
              {price}
            </Text>
            {product.description && (
              <Text color="$textSecondary" lineHeight="$5">
                {product.description}
              </Text>
            )}

            {added ? (
              <YStack padding="$3" backgroundColor="$backgroundHover" borderRadius="$3">
                <Text color="$text" fontWeight="600">
                  ✓ Tillagd i varukorgen
                </Text>
              </YStack>
            ) : (
              <Button
                backgroundColor="$primary"
                borderRadius="$3"
                onPress={handleAddToCart}
                disabled={addToCart.isPending || !variant}
              >
                <XStack gap="$2" alignItems="center">
                  {addToCart.isPending && <Spinner color="white" size="small" />}
                  <Text color="white" fontWeight="700">
                    Lägg i varukorg
                  </Text>
                </XStack>
              </Button>
            )}
          </YStack>
        </XStack>
      </YStack>
    </YStack>
  )
}
