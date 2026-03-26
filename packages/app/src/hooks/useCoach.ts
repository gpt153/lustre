import { useCallback } from 'react'
import { trpc } from '@lustre/api'
import { TRPCClientError } from '@trpc/client'
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
    ): Promise<{ session?: { id: string; roomName: string }; token?: string; wsUrl?: string; roomName?: string; error?: 'INSUFFICIENT_BALANCE' }> => {
      try {
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
      } catch (error) {
        if (error instanceof TRPCClientError && error.data?.code === 'PRECONDITION_FAILED') {
          return { error: 'INSUFFICIENT_BALANCE' as const }
        }
        throw error
      }
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
