'use client'

import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
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

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([key, value]) => ({
  key,
  label: value,
}))

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)

  const listingsQuery = trpc.listing.list.useInfiniteQuery(
    { limit: 20, category: selectedCategory as unknown as string | undefined },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const listings = listingsQuery.data?.pages.flatMap((page) => page.listings) ?? []

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listingsQuery.hasNextPage && !listingsQuery.isFetchingNextPage) {
          listingsQuery.fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [listingsQuery.hasNextPage, listingsQuery.isFetchingNextPage])

  if (listingsQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={1200} gap="$6">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">Shop</Text>
          <Link href="/shop/create" style={{ textDecoration: 'none' }}>
            <Button backgroundColor="$primary" borderRadius="$3" paddingHorizontal="$4">
              <Text color="white" fontWeight="600">Create Listing</Text>
            </Button>
          </Link>
        </XStack>

        <XStack gap="$2" flexWrap="wrap">
          <Button
            onPress={() => setSelectedCategory(undefined)}
            backgroundColor={selectedCategory === undefined ? '$primary' : '$background'}
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$2"
            paddingHorizontal="$3"
            paddingVertical="$2"
          >
            <Text color={selectedCategory === undefined ? 'white' : '$text'} fontWeight="600">
              All
            </Text>
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              backgroundColor={selectedCategory === cat.key ? '$primary' : '$background'}
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$2"
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              <Text color={selectedCategory === cat.key ? 'white' : '$text'} fontWeight="600">
                {cat.label}
              </Text>
            </Button>
          ))}
        </XStack>

        {listings.length === 0 ? (
          <YStack alignItems="center" padding="$8">
            <Text color="$textSecondary" fontSize="$4">No listings found</Text>
          </YStack>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {listings.map((listing) => (
              <Link key={listing.id} href={`/shop/listing/${listing.id}`} style={{ textDecoration: 'none' }}>
                <ListingCard listing={listing} />
              </Link>
            ))}
          </div>
        )}

        <div ref={loadMoreRef} style={{ height: 1 }} />

        {listingsQuery.isFetchingNextPage && (
          <YStack padding="$4" alignItems="center">
            <Spinner color="$primary" />
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

function ListingCard({ listing }: {
  listing: {
    id: string
    title: string
    description: string
    price: number
    category: string
    images: Array<{ id: string; url: string; order: number }>
    seller: { displayName: string | null }
  }
}) {
  const image = listing.images.sort((a, b) => a.order - b.order)[0]

  return (
    <YStack
      backgroundColor="$background"
      borderRadius="$3"
      overflow="hidden"
      borderWidth={1}
      borderColor="$borderColor"
      hoverStyle={{ borderColor: '$primary', opacity: 0.9 }}
      cursor="pointer"
      gap="$0"
    >
      {image && (
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#E0E0E0',
          overflow: 'hidden',
        }}>
          <img
            src={image.url}
            alt={listing.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}
      <YStack padding="$3" gap="$2" flex={1}>
        <Text fontWeight="700" color="$text" numberOfLines={2}>
          {listing.title}
        </Text>
        <Text fontSize="$2" color="$textSecondary" numberOfLines={2}>
          {listing.description}
        </Text>
        <YStack flex={1} />
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontWeight="700" fontSize="$4" color="$primary">
            {(listing.price / 100).toFixed(0)} kr
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            {CATEGORY_LABELS[listing.category] || listing.category}
          </Text>
        </XStack>
        <Text fontSize="$1" color="$textSecondary">
          {listing.seller.displayName || 'Anonymous'}
        </Text>
      </YStack>
    </YStack>
  )
}
