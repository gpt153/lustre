import { trpc } from '@lustre/api'

export function useGroups() {
  const listQuery = trpc.group.list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const joinMutation = trpc.group.join.useMutation()
  const leaveMutation = trpc.group.leave.useMutation()
  const createMutation = trpc.group.create.useMutation()

  const groups = listQuery.data?.pages.flatMap((page) => page.groups) ?? []

  const join = async (groupId: string) => {
    await joinMutation.mutateAsync({ groupId })
    listQuery.refetch()
  }

  const leave = async (groupId: string) => {
    await leaveMutation.mutateAsync({ groupId })
    listQuery.refetch()
  }

  const create = async (data: { name: string; description?: string; category: string; visibility?: 'OPEN' | 'PRIVATE' }) => {
    const group = await createMutation.mutateAsync(data)
    listQuery.refetch()
    return group
  }

  return {
    groups,
    isLoading: listQuery.isLoading,
    isFetchingNextPage: listQuery.isFetchingNextPage,
    hasNextPage: listQuery.hasNextPage ?? false,
    fetchNextPage: listQuery.fetchNextPage,
    refetch: listQuery.refetch,
    join,
    leave,
    create,
    isCreating: createMutation.isPending,
  }
}
