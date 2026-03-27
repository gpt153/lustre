import { trpc } from '@lustre/api'

export function useIntentions() {
  const listQuery = trpc.intention.list.useQuery()
  const createMutation = trpc.intention.create.useMutation({ onSuccess: () => listQuery.refetch() })
  const updateMutation = trpc.intention.update.useMutation({ onSuccess: () => listQuery.refetch() })
  const pauseMutation = trpc.intention.pause.useMutation({ onSuccess: () => listQuery.refetch() })
  const resumeMutation = trpc.intention.resume.useMutation({ onSuccess: () => listQuery.refetch() })
  const deleteMutation = trpc.intention.delete.useMutation({ onSuccess: () => listQuery.refetch() })

  return {
    intentions: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    refetch: listQuery.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    pause: pauseMutation.mutateAsync,
    resume: resumeMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

export function useIntentionFeed(intentionId: string) {
  const feedQuery = trpc.intention.getFeed.useInfiniteQuery(
    { intentionId, limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const results = feedQuery.data?.pages.flatMap(p => p.results) ?? []

  return {
    results,
    isLoading: feedQuery.isLoading,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
  }
}
