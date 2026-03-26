import { useState, useCallback, useEffect, useRef } from 'react'
import { trpc } from '@lustre/api'

export function useMigration() {
  const [username, setUsername] = useState('')
  const shouldFetchRef = useRef(false)

  const previewQuery = trpc.migration.previewBodyContact.useQuery(
    { username },
    { enabled: false, retry: false }
  )

  const importMutation = trpc.migration.importBodyContact.useMutation()

  // After username state update settles, trigger the actual refetch
  useEffect(() => {
    if (shouldFetchRef.current && username) {
      shouldFetchRef.current = false
      previewQuery.refetch()
    }
  }, [username]) // eslint-disable-line react-hooks/exhaustive-deps

  const triggerPreview = useCallback((inputUsername: string) => {
    const trimmed = inputUsername.trim()
    if (!trimmed) return
    shouldFetchRef.current = true
    setUsername(trimmed)
  }, [])

  return {
    username,
    triggerPreview,
    previewQuery,
    importMutation,
  }
}
