import { YStack, XStack, Text, Image } from 'tamagui'

const CATEGORY_LABELS: Record<string, string> = {
  UNDERWEAR: 'Underkläder',
  TOYS: 'Leksaker',
  FETISH_ITEMS: 'Fetisch',
  HANDMADE_GOODS: 'Handgjort',
  ACCESSORIES: 'Tillbehör',
  CLOTHING: 'Kläder',
  OTHER: 'Övrigt',
}

interface ListingCardProps {
  listing: {
    id: string
    title: string
    price: number
    category: string
    images: { id: string; url: string; order: number }[]
    seller: { displayName: string | null }
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0].url : null
  const priceInSEK = (listing.price / 100).toFixed(0)

  return (
    <YStack
      backgroundColor="$gray2"
      borderRadius="$4"
      overflow="hidden"
      gap="$2"
      paddingBottom="$3"
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          width="100%"
          height={180}
          borderRadius="$4"
        />
      ) : (
        <YStack
          width="100%"
          height={180}
          backgroundColor="$gray6"
          alignItems="center"
          justifyContent="center"
          borderRadius="$4"
        >
          <Text color="$gray10" fontSize={14}>
            Ingen bild
          </Text>
        </YStack>
      )}

      <YStack paddingHorizontal="$3" gap="$2">
        <Text fontSize={15} fontWeight="600" color="$color" numberOfLines={2}>
          {listing.title}
        </Text>

        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={16} fontWeight="700" color="$pink8">
            {priceInSEK} kr
          </Text>
          <XStack
            backgroundColor="$pink2"
            borderRadius="$2"
            paddingHorizontal="$2"
            paddingVertical={2}
          >
            <Text fontSize={12} color="$pink8" fontWeight="500">
              {CATEGORY_LABELS[listing.category] || listing.category}
            </Text>
          </XStack>
        </XStack>

        {listing.seller.displayName && (
          <Text fontSize={12} color="$gray10">
            Säljare: {listing.seller.displayName}
          </Text>
        )}
      </YStack>
    </YStack>
  )
}
