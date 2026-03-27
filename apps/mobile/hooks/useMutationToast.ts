import { useEffect } from 'react'
import { toastStore } from '@lustre/app'

/**
 * Shape of a TanStack Query (or tRPC) mutation result that we observe.
 * Using a structural interface so this hook works with any mutation type
 * without importing the full TanStack Query package here.
 */
interface MutationLike {
  isSuccess: boolean
  isError: boolean
  error: unknown
}

function resolveErrorMessage(error: unknown): string {
  if (!error) return 'Något gick fel. Försök igen.'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  return 'Något gick fel. Försök igen.'
}

/**
 * useMutationToast
 *
 * Watches a TanStack Query / tRPC mutation and automatically shows a toast
 * on success or error. The store is accessed directly (not via React state)
 * to avoid unnecessary re-renders.
 *
 * @example
 * const updateProfile = trpc.profile.update.useMutation()
 * useMutationToast(updateProfile, 'Profil uppdaterad!')
 *
 * @param mutation  Any object with `isSuccess`, `isError`, and `error` fields
 * @param successMsg  Message shown on success
 * @param errorMsg    Optional custom error message (falls back to mutation.error.message)
 */
export function useMutationToast<T extends MutationLike>(
  mutation: T,
  successMsg: string,
  errorMsg?: string,
): void {
  useEffect(() => {
    if (mutation.isSuccess) {
      toastStore.getState().success(successMsg)
    }
  }, [mutation.isSuccess, successMsg])

  useEffect(() => {
    if (mutation.isError) {
      const message = errorMsg ?? resolveErrorMessage(mutation.error)
      toastStore.getState().error(message)
    }
  }, [mutation.isError, mutation.error, errorMsg])
}
