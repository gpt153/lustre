import { toastStore } from '@lustre/app'
import type { ToastOpts } from '@lustre/app'

/**
 * useToast
 *
 * React hook that exposes the toast store methods for use inside components.
 * For use outside the React tree, import `toast` from `@lustre/app` directly.
 *
 * @example
 * const toast = useToast()
 * toast.success('Profile updated!')
 * toast.error('Something went wrong', { duration: 6000 })
 */
export function useToast() {
  const success = toastStore((s) => s.success)
  const error = toastStore((s) => s.error)
  const info = toastStore((s) => s.info)
  const warning = toastStore((s) => s.warning)
  const dismiss = toastStore((s) => s.dismiss)
  const clearAll = toastStore((s) => s.clearAll)

  return {
    success: (message: string, opts?: ToastOpts) => success(message, opts),
    error: (message: string, opts?: ToastOpts) => error(message, opts),
    info: (message: string, opts?: ToastOpts) => info(message, opts),
    warning: (message: string, opts?: ToastOpts) => warning(message, opts),
    dismiss,
    clearAll,
  }
}
