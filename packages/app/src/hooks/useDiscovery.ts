import { trpc } from '@lustre/api'

export function useDiscovery() {
  const discoveryStackQuery = trpc.match.getDiscoveryStack.useQuery({ limit: 20 })
  const swipeMutation = trpc.match.swipe.useMutation()
  const matchesQuery = trpc.match.getMatches.useQuery()

  const profiles = discoveryStackQuery.data ?? []

  const swipe = async (targetId: string, action: 'LIKE' | 'PASS') => {
    const result = await swipeMutation.mutateAsync({ targetId, action })
    discoveryStackQuery.refetch()
    return result
  }

  const matches = matchesQuery.data ?? []

  return {
    profiles,
    isLoading: discoveryStackQuery.isLoading,
    swipe,
    matches,
    matchesLoading: matchesQuery.isLoading,
    refetch: discoveryStackQuery.refetch,
    isSwiping: swipeMutation.isPending,
  }
}
