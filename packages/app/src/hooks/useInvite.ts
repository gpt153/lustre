import { trpc } from '@lustre/api'

export function useInvite() {
  const generateMutation = trpc.invite.generate.useMutation()
  const myLinksQuery = trpc.invite.getMyLinks.useQuery()
  const claimMutation = trpc.invite.claim.useMutation()
  const rewardsQuery = trpc.invite.getRewards.useQuery()

  const generate = async () => {
    const result = await generateMutation.mutateAsync()
    myLinksQuery.refetch()
    return result
  }

  const claim = async (code: string) => {
    const result = await claimMutation.mutateAsync({ code })
    rewardsQuery.refetch()
    return result
  }

  return {
    links: myLinksQuery.data ?? [],
    isLoadingLinks: myLinksQuery.isLoading,
    generate,
    isGenerating: generateMutation.isPending,
    claim,
    isClaiming: claimMutation.isPending,
    rewards: rewardsQuery.data,
    isLoadingRewards: rewardsQuery.isLoading,
    generateError: generateMutation.error,
    claimError: claimMutation.error,
  }
}
