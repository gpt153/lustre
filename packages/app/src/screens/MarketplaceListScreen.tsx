import { useCallback, useMemo, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import { YStack, XStack, Text, Spinner, ScrollView } from 'tamagui'
import { trpc } from '@lustre/api'
import { ListingCard } from '../components/ListingCard'

export type Category = 'ALL' | 'UNDERWEAR' | 'TOYS' | 'FETISH_ITEMS' | 'HANDMADE_GOODS' | 'ACCESSORIES' | 'CLOTHING' | 'OTHER'

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Alla', value: 'ALL' },
  { label: 'Underkläder', value: 'UNDERWEAR' },
  { label: 'Leksaker', value: 'TOYS' },
  { label: 'Fetisch', value: 'FETISH_ITEMS' },
  { label: 'Handgjort', value: 'HANDMADE_GOODS' },
  { label: 'Tillbehör', value: 'ACCESSORIES' },
  { label: 'Kläder', value: 'CLOTHING' },
  { label: 'Övrigt', value: 'OTHER' },
]

interface MarketplaceListScreenProps {
  onListingPress: (listingId: string) => void
  onCreatePress: () => void
}

export function MarketplaceListScreen({ onListingPress, onCreatePress }: MarketplaceListScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL')

  const { data, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage, refetch } = trpc.listing.list.useInfiniteQuery(
    {
      limit: 20,
      category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const listings = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? []
  }, [data])

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
  }

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" justifyContent="space-between">
        <Text fontSize={20} fontWeight="700" color="$color">
          Shop
        </Text>
        <TouchableOpacity onPress={onCreatePress}>
          <Text fontSize={18} fontWeight="600" color="$pink9">
            Sälj
          </Text>
        </TouchableOpacity>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} paddingHorizontal="$4" height={45}>
        <XStack gap="$2" paddingVertical="$2">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.value} onPress={() => handleCategoryChange(cat.value)}>
              <XStack
                backgroundColor={selectedCategory === cat.value ? '$pink8' : '$gray4'}
                borderRadius="$3"
                paddingHorizontal="$3"
                paddingVertical="$2"
              >
                <Text
                  fontSize={13}
                  fontWeight={selectedCategory === cat.value ? '600' : '500'}
                  color={selectedCategory === cat.value ? 'white' : '$color'}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </XStack>
            </TouchableOpacity>
          ))}
        </XStack>
      </ScrollView>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onListingPress(item.id)}>
            <View paddingHorizontal={16} paddingVertical={8}>
              <ListingCard listing={item} />
            </View>
          </TouchableOpacity>
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor="#B87333" colors={['#B87333']} />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <YStack padding="$4" alignItems="center">
              <Spinner color="$primary" />
            </YStack>
          ) : null
        }
        ListEmptyComponent={
          <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
            <Text color="$gray10">Inga annonser ännu</Text>
          </YStack>
        }
      />
    </YStack>
  )
}
