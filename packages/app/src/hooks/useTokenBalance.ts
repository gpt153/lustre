import { trpc } from '@lustre/api'

export function useTokenBalance() {
  const query = trpc.token.getBalance.useQuery()
  return { balance: query.data?.balance ?? 0, isLoading: query.isLoading }
}
