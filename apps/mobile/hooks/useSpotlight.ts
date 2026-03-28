import { trpc } from '@lustre/api'
import { useState, useEffect, useCallback } from 'react'

export function useSpotlight() {
  const creditsQuery = trpc.priority.getSpotlightCredits.useQuery()
  const statusQuery = trpc.priority.getSpotlightStatus.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30s when active
  })
  const activateMutation = trpc.priority.activateSpotlight.useMutation({
    onSuccess: () => {
      creditsQuery.refetch()
      statusQuery.refetch()
    },
  })

  // Local countdown timer
  const [localRemaining, setLocalRemaining] = useState(0)

  // Sync with server status
  useEffect(() => {
    if (statusQuery.data?.active) {
      setLocalRemaining(statusQuery.data.remainingSeconds)
    } else {
      setLocalRemaining(0)
    }
  }, [statusQuery.data])

  // Tick down every second
  useEffect(() => {
    if (localRemaining <= 0) return
    const timer = setInterval(() => {
      setLocalRemaining((prev) => {
        if (prev <= 1) {
          statusQuery.refetch()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [localRemaining > 0, statusQuery])

  const activate = useCallback(async () => {
    const result = await activateMutation.mutateAsync()
    setLocalRemaining(result.remainingSeconds)
    return result
  }, [activateMutation])

  const isActive = localRemaining > 0 || (statusQuery.data?.active ?? false)

  return {
    credits: creditsQuery.data?.credits ?? 0,
    isActive,
    remainingSeconds: localRemaining,
    activate,
    isActivating: activateMutation.isPending,
    isLoading: creditsQuery.isLoading || statusQuery.isLoading,
  }
}
