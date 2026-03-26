import { useState } from 'react'
import { ScrollView, View, FlatList, TouchableOpacity } from 'react-native'
import { YStack, XStack, Text, Spinner, Button, AlertDialog } from 'tamagui'
import { trpc } from '@lustre/api'

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

interface ListingDetailScreenProps {
  listingId: string
  onBuySuccess: (orderId: string) => void
  onClose: () => void
}

export function ListingDetailScreen({ listingId, onBuySuccess, onClose }: ListingDetailScreenProps) {
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | null>(null)
  const [showShippingPicker, setShowShippingPicker] = useState(false)

  const { data: listing, isLoading } = trpc.listing.getById.useQuery({ id: listingId })
  const createOrderMutation = trpc.order.create.useMutation()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!listing) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$gray10">Annonsen hittades inte</Text>
      </YStack>
    )
  }

  const priceInSEK = (listing.price / 100).toFixed(0)
  const isOwnListing = false

  const handleBuyPress = () => {
    if (!selectedShippingOption) {
      setShowShippingPicker(true)
      return
    }

    createOrderMutation.mutate(
      {
        listingId,
        shippingOption: selectedShippingOption as any,
      },
      {
        onSuccess: (order) => {
          onBuySuccess(order.id)
        },
      }
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView flex={1}>
        <YStack gap="$4" padding="$4">
          {/* Images */}
          {listing.images && listing.images.length > 0 && (
            <FlatList
              data={listing.images}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View marginRight={10} width={300} height={300}>
                  <TouchableOpacity>
                    <YStack
                      width="100%"
                      height="100%"
                      backgroundColor="$gray6"
                      borderRadius="$4"
                      overflow="hidden"
                    >
                      {item.url && (
                        <YStack flex={1} backgroundColor="$gray2" />
                      )}
                    </YStack>
                  </TouchableOpacity>
                </View>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            />
          )}

          {/* Title and Price */}
          <YStack gap="$2">
            <Text fontSize={24} fontWeight="700" color="$color">
              {listing.title}
            </Text>
            <Text fontSize={32} fontWeight="700" color="$pink8">
              {priceInSEK} kr
            </Text>
          </YStack>

          {/* Description */}
          {listing.description && (
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="600" color="$color">
                Beskrivning
              </Text>
              <Text fontSize={14} color="$gray10" lineHeight={20}>
                {listing.description}
              </Text>
            </YStack>
          )}

          {/* Category and Seller */}
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center">
              <XStack
                backgroundColor="$pink2"
                borderRadius="$2"
                paddingHorizontal="$2"
                paddingVertical={4}
              >
                <Text fontSize={12} color="$pink8" fontWeight="500">
                  {CATEGORY_LABELS[listing.category] || listing.category}
                </Text>
              </XStack>
            </XStack>

            {listing.seller.displayName && (
              <Text fontSize={13} color="$gray10">
                Säljare: {listing.seller.displayName}
              </Text>
            )}
          </YStack>

          {/* Shipping Options */}
          {listing.shippingOptions && listing.shippingOptions.length > 0 && (
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="600" color="$color">
                Leveransalternativ
              </Text>
              <YStack gap="$2">
                {listing.shippingOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setSelectedShippingOption(option)}
                  >
                    <XStack
                      backgroundColor={selectedShippingOption === option ? '$pink2' : '$gray4'}
                      borderRadius="$2"
                      padding="$3"
                      borderWidth={1}
                      borderColor={selectedShippingOption === option ? '$pink8' : '$gray6'}
                    >
                      <Text
                        fontSize={13}
                        color={selectedShippingOption === option ? '$pink8' : '$color'}
                        fontWeight={selectedShippingOption === option ? '600' : '500'}
                      >
                        {SHIPPING_LABELS[option] || option}
                      </Text>
                    </XStack>
                  </TouchableOpacity>
                ))}
              </YStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Buy Button */}
      {!isOwnListing && (
        <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            onPress={handleBuyPress}
            disabled={createOrderMutation.isPending}
            backgroundColor="$pink8"
            color="white"
            size="$5"
          >
            {createOrderMutation.isPending ? 'Behandlar...' : 'Köp nu'}
          </Button>
        </YStack>
      )}
    </YStack>
  )
}
