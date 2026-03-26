'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_LABELS: Record<string, string> = {
  UNDERWEAR: 'Underkläder',
  TOYS: 'Leksaker',
  FETISH_ITEMS: 'Fetisch',
  HANDMADE_GOODS: 'Handgjort',
  ACCESSORIES: 'Tillbehör',
  CLOTHING: 'Kläder',
  OTHER: 'Övrigt',
}

const SHIPPING_LABELS: Record<string, string> = {
  STANDARD_POST: 'Standardpost',
  EXPRESS_POST: 'Expresspost',
  PICKUP: 'Upphämtning',
}

export default function ListingDetailPage({ params }: { params: { listingId: string } }) {
  const router = useRouter()
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false)
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | undefined>()

  const listingQuery = trpc.listing.getById.useQuery({ id: params.listingId })
  const createOrderMutation = trpc.order.create.useMutation()

  const handleBuyNow = async () => {
    if (!selectedShippingOption) {
      alert('Please select a shipping option')
      return
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        listingId: params.listingId,
        shippingOption: selectedShippingOption as any,
      })
      router.push(`/shop/order/${result.id}`)
    } catch (error) {
      alert('Failed to create order')
    }
  }

  if (listingQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!listingQuery.data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">Listing not found</Text>
      </YStack>
    )
  }

  const listing = listingQuery.data
  const sortedImages = [...listing.images].sort((a, b) => a.order - b.order)

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={1000} gap="$6">
        <Link href="/shop" style={{ textDecoration: 'none' }}>
          <Button
            size="$2"
            backgroundColor="$background"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$2"
            paddingHorizontal="$3"
          >
            <Text color="$text">← Back</Text>
          </Button>
        </Link>

        <XStack gap="$6" alignItems="flex-start">
          <YStack flex={1} gap="$3">
            {sortedImages.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}>
                {sortedImages.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#E0E0E0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={image.url}
                      alt="Listing"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </YStack>

          <YStack flex={1} gap="$4">
            <YStack gap="$2">
              <Text fontSize="$6" fontWeight="700" color="$text">
                {listing.title}
              </Text>
              <Text fontSize="$3" color="$textSecondary">
                {listing.description}
              </Text>
            </YStack>

            <YStack gap="$3" borderTopWidth={1} borderColor="$borderColor" paddingTopWidth={16} gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$5" fontWeight="700" color="$primary">
                  {(listing.price / 100).toFixed(0)} kr
                </Text>
              </XStack>

              <YStack gap="$2">
                <Text fontWeight="600" color="$text">Category</Text>
                <Text color="$textSecondary">
                  {CATEGORY_LABELS[listing.category] || listing.category}
                </Text>
              </YStack>

              <YStack gap="$2">
                <Text fontWeight="600" color="$text">Seller</Text>
                <Text color="$textSecondary">
                  {listing.seller.displayName || 'Anonymous'}
                </Text>
              </YStack>

              <YStack gap="$2">
                <Text fontWeight="600" color="$text">Shipping Options</Text>
                <YStack gap="$2">
                  {listing.shippingOptions.map((option) => (
                    <Button
                      key={option}
                      onPress={() => setSelectedShippingOption(option)}
                      backgroundColor={selectedShippingOption === option ? '$primary' : '$background'}
                      borderColor={selectedShippingOption === option ? '$primary' : '$borderColor'}
                      borderWidth={1}
                      borderRadius="$2"
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      justifyContent="flex-start"
                    >
                      <Text color={selectedShippingOption === option ? 'white' : '$text'} fontWeight="600">
                        {SHIPPING_LABELS[option] || option}
                      </Text>
                    </Button>
                  ))}
                </YStack>
              </YStack>

              <Button
                onPress={handleBuyNow}
                disabled={!selectedShippingOption || createOrderMutation.isPending}
                backgroundColor="$primary"
                borderRadius="$3"
                paddingVertical="$3"
              >
                <Text color="white" fontWeight="700" fontSize="$4">
                  {createOrderMutation.isPending ? 'Creating Order...' : 'Köp nu'}
                </Text>
              </Button>
            </YStack>
          </YStack>
        </XStack>
      </YStack>
    </YStack>
  )
}
