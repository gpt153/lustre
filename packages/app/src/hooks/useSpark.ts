import { trpc } from '@lustre/api'

export function useSpark() {
  const balanceQuery = trpc.priority.getSparkBalance.useQuery()
  const sendMutation = trpc.priority.sendSpark.useMutation({
    onSuccess: () => {
      balanceQuery.refetch()
    },
  })

  return {
    balance: balanceQuery.data?.balance ?? 0,
    isLoading: balanceQuery.isLoading,
    sendSpark: async (recipientId: string) => {
      const result = await sendMutation.mutateAsync({ recipientId })
      return result.balance
    },
    isSending: sendMutation.isPending,
  }
}
