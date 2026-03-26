import { trpc } from '@lustre/api'
import { useCallback, useEffect } from 'react'
import { useModeStore } from '../stores/modeStore'

export function useMode() {
  const { mode, setMode } = useModeStore()
  const modeQuery = trpc.settings.getMode.useQuery(undefined, { staleTime: 30_000 })
  const setModeMutation = trpc.settings.setMode.useMutation()

  useEffect(() => {
    if (modeQuery.data) {
      setMode(modeQuery.data.mode)
    }
  }, [modeQuery.data, setMode])

  const handleSetMode = useCallback(
    async (newMode: 'vanilla' | 'spicy') => {
      setMode(newMode)
      await setModeMutation.mutateAsync({ mode: newMode })
    },
    [setMode, setModeMutation]
  )

  return {
    mode,
    setMode: handleSetMode,
    isSpicy: mode === 'spicy',
    isLoading: modeQuery.isLoading,
  }
}
