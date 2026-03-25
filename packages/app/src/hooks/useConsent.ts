import { trpc } from '@lustre/api'

export function useConsent() {
  const getRecordingsQuery = trpc.consent.getRecordings.useQuery()
  const initiateMutation = trpc.consent.initiate.useMutation()
  const confirmMutation = trpc.consent.confirm.useMutation()
  const revokeMutation = trpc.consent.revoke.useMutation()
  const deleteMutation = trpc.consent.delete.useMutation()
  const getUploadUrlMutation = trpc.consent.getUploadUrl.useMutation()
  const confirmUploadMutation = trpc.consent.confirmUpload.useMutation()

  return {
    recordings: getRecordingsQuery.data ?? [],
    isLoading: getRecordingsQuery.isLoading,
    refetch: getRecordingsQuery.refetch,
    initiateConsent: initiateMutation.mutateAsync,
    confirmConsent: confirmMutation.mutateAsync,
    revokeRecording: revokeMutation.mutateAsync,
    deleteRecording: deleteMutation.mutateAsync,
    getUploadUrl: getUploadUrlMutation.mutateAsync,
    confirmUpload: confirmUploadMutation.mutateAsync,
    isInitiating: initiateMutation.isPending,
    isConfirming: confirmMutation.isPending,
  }
}
