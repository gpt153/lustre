import { useCallback } from 'react'
import { trpc } from '@lustre/api'
import { useAuthStore } from '../stores/authStore'

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function useCoach() {
  const accessToken = useAuthStore((state) => state.accessToken)

  const listQuery = trpc.coach.list.useQuery()
  const createMutation = trpc.coach.create.useMutation()
  const startMutation = trpc.coach.start.useMutation()
  const endMutation = trpc.coach.end.useMutation()

  const createSession = useCallback(
    async (
      persona: 'COACH' | 'PARTNER',
      mode: 'VOICE' | 'TEXT'
    ): Promise<{ session: { id: string; roomName: string }; token: string; wsUrl: string; roomName: string }> => {
      const tokenRes = await fetch(`${API_URL}/api/coach/token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ persona, mode }),
      })
      const { token, wsUrl, roomName } = await tokenRes.json()

      const session = await createMutation.mutateAsync({ persona, mode, roomName })

      return { session, token, wsUrl, roomName }
    },
    [accessToken, createMutation]
  )

  const startSession = useCallback(
    async (sessionId: string): Promise<void> => {
      await startMutation.mutateAsync({ sessionId })
    },
    [startMutation]
  )

  const endSession = useCallback(
    async (sessionId: string, durationSecs: number): Promise<void> => {
      await endMutation.mutateAsync({ sessionId, durationSecs })
    },
    [endMutation]
  )

  return {
    sessions: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    createSession,
    startSession,
    endSession,
  }
}
