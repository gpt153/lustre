import { trpc } from '@lustre/api'

export function useGatekeeper() {
  const configQuery = trpc.gatekeeper.getConfig.useQuery()
  const updateConfig = trpc.gatekeeper.updateConfig.useMutation()
  const toggle = trpc.gatekeeper.toggle.useMutation()
  const checkRequired = trpc.gatekeeper.checkRequired.useMutation()
  const initiate = trpc.gatekeeper.initiate.useMutation()
  const respond = trpc.gatekeeper.respond.useMutation()
  const utils = trpc.useUtils()

  return {
    config: configQuery.data ?? null,
    isLoading: configQuery.isLoading,
    updateConfig: async (data: {
      strictness?: 'MILD' | 'STANDARD' | 'STRICT'
      customQuestions?: string[]
      dealbreakers?: string[]
      aiTone?: 'FORMAL' | 'CASUAL' | 'FLIRTY'
    }) => {
      const result = await updateConfig.mutateAsync(data)
      utils.gatekeeper.getConfig.invalidate()
      return result
    },
    toggle: async () => {
      const result = await toggle.mutateAsync()
      utils.gatekeeper.getConfig.invalidate()
      return result
    },
    checkRequired: (recipientId: string) =>
      checkRequired.mutateAsync({ recipientId }),
    initiate: (recipientId: string, message: string) =>
      initiate.mutateAsync({ recipientId, message }),
    respond: (conversationId: string, message: string) =>
      respond.mutateAsync({ conversationId, message }),
    isUpdating: updateConfig.isPending || toggle.isPending,
    isInitiating: initiate.isPending,
    isResponding: respond.isPending,
  }
}
