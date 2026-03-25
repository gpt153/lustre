import { trpc } from '@lustre/api'

export function useEvents(options?: { type?: 'ONLINE' | 'IRL' | 'HYBRID' }) {
  const listQuery = trpc.event.listFiltered.useInfiniteQuery(
    { type: options?.type, limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
  )

  const rsvpMutation = trpc.event.rsvp.useMutation()
  const purchaseTicketMutation = trpc.event.purchaseTicket.useMutation()
  const createMutation = trpc.event.create.useMutation()

  const events = listQuery.data?.pages.flatMap((p: any) => p.events) ?? []

  const rsvp = async (eventId: string) => {
    await rsvpMutation.mutateAsync({ eventId, status: 'GOING' })
    await listQuery.refetch()
  }

  const purchaseTicket = async (eventId: string, phoneNumber?: string) => {
    return purchaseTicketMutation.mutateAsync({ eventId, phoneNumber })
  }

  return {
    events,
    isLoading: listQuery.isLoading,
    hasNextPage: listQuery.hasNextPage ?? false,
    fetchNextPage: listQuery.fetchNextPage,
    isFetchingNextPage: listQuery.isFetchingNextPage,
    refetch: listQuery.refetch,
    rsvp,
    purchaseTicket,
    isRsvping: rsvpMutation.isPending,
    createMutation,
  }
}
