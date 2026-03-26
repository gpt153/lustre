import { trpc } from '@lustre/api'

export function useKudos() {
  const utils = trpc.useUtils()

  const listBadgesQuery = trpc.kudos.listBadges.useQuery()
  const pendingPromptsQuery = trpc.kudos.getPendingPrompts.useQuery()
  const suggestBadgesMutation = trpc.kudos.suggestBadges.useMutation()
  const giveMutation = trpc.kudos.give.useMutation()
  const dismissMutation = trpc.kudos.dismissPrompt.useMutation()

  return {
    badges: listBadgesQuery.data ?? [],
    isLoadingBadges: listBadgesQuery.isLoading,
    pendingPrompts: pendingPromptsQuery.data ?? [],
    isLoadingPrompts: pendingPromptsQuery.isLoading,
    suggestBadges: async (freeText: string) => {
      const result = await suggestBadgesMutation.mutateAsync({ freeText })
      return result.suggestedBadgeIds
    },
    isSuggesting: suggestBadgesMutation.isPending,
    give: async (data: { recipientId: string; matchId?: string; badgeIds: string[] }) => {
      const result = await giveMutation.mutateAsync(data)
      utils.kudos.getPendingPrompts.invalidate()
      return result
    },
    isGiving: giveMutation.isPending,
    dismissPrompt: async (promptId: string) => {
      await dismissMutation.mutateAsync({ promptId })
      utils.kudos.getPendingPrompts.invalidate()
    },
    getProfileKudos: (userId: string) => {
      return trpc.kudos.getProfileKudos.useQuery({ userId })
    },
    refetch: () => {
      utils.kudos.getPendingPrompts.invalidate()
      utils.kudos.listBadges.invalidate()
    },
  }
}
