import { trpc } from '@lustre/api'

export function useSafeDate() {
  const listQuery = trpc.safedate.list.useQuery()
  const activateMutation = trpc.safedate.activate.useMutation()
  const checkinMutation = trpc.safedate.checkin.useMutation()
  const extendMutation = trpc.safedate.extend.useMutation()
  const endMutation = trpc.safedate.end.useMutation()
  const logGPSMutation = trpc.safedate.logGPS.useMutation()

  const activeSafeDate = listQuery.data?.find(
    sd => sd.status === 'ACTIVE' || sd.status === 'CHECKED_IN'
  ) ?? null

  return {
    activeSafeDate,
    safeDates: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    activate: activateMutation.mutateAsync,
    checkin: checkinMutation.mutateAsync,
    extend: extendMutation.mutateAsync,
    end: endMutation.mutateAsync,
    logGPS: logGPSMutation.mutateAsync,
    refetch: listQuery.refetch,
  }
}
