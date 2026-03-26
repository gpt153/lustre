import { useMemo } from 'react'
import { trpc } from '@lustre/api'

export function useMarketplace() {
  const listingsQuery = trpc.listing.list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const createListingMutation = trpc.listing.create.useMutation()
  const removeListingMutation = trpc.listing.remove.useMutation()
  const createOrderMutation = trpc.order.create.useMutation()
  const confirmDeliveryMutation = trpc.order.confirmDelivery.useMutation()

  const listings = useMemo(() => {
    return listingsQuery.data?.pages.flatMap((page) => page.items) ?? []
  }, [listingsQuery.data])

  return {
    listings,
    fetchMore: listingsQuery.fetchNextPage,
    hasNextPage: listingsQuery.hasNextPage,
    isFetchingNextPage: listingsQuery.isFetchingNextPage,
    isLoadingListings: listingsQuery.isLoading,
    createListing: createListingMutation.mutate,
    createListingAsync: createListingMutation.mutateAsync,
    removeListing: removeListingMutation.mutate,
    removeListingAsync: removeListingMutation.mutateAsync,
    createOrder: createOrderMutation.mutate,
    createOrderAsync: createOrderMutation.mutateAsync,
    confirmDelivery: confirmDeliveryMutation.mutate,
    confirmDeliveryAsync: confirmDeliveryMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
    isConfirmingDelivery: confirmDeliveryMutation.isPending,
  }
}
