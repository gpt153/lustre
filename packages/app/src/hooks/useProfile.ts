import { trpc } from '@lustre/api'
import { useProfileStore } from '../stores/profileStore'
import { useEffect } from 'react'

export function useProfile() {
  const query = trpc.profile.get.useQuery(undefined, {
    retry: false,
  })
  const store = useProfileStore()

  useEffect(() => {
    if (query.data) {
      store.setHasProfile(true)
    } else if (query.error?.data?.code === 'NOT_FOUND') {
      store.setHasProfile(false)
    }
  }, [query.data, query.error])

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    hasProfile: store.hasProfile,
    needsOnboarding: store.needsOnboarding,
    refetch: query.refetch,
  }
}
