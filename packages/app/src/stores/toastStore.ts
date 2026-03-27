import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  onPress: () => void
}

export interface Toast {
  id: string
  variant: ToastVariant
  message: string
  action?: ToastAction
  duration: number
  createdAt: number
}

export interface ToastOpts {
  action?: ToastAction
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  success: (message: string, opts?: ToastOpts) => void
  error: (message: string, opts?: ToastOpts) => void
  info: (message: string, opts?: ToastOpts) => void
  warning: (message: string, opts?: ToastOpts) => void
  dismiss: (id: string) => void
  clearAll: () => void
}

const MAX_TOASTS = 3
const DEFAULT_DURATION = 4000

function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function addToast(
  variant: ToastVariant,
  message: string,
  opts: ToastOpts | undefined,
  currentToasts: Toast[],
): Toast[] {
  const toast: Toast = {
    id: generateId(),
    variant,
    message,
    action: opts?.action,
    duration: opts?.duration ?? DEFAULT_DURATION,
    createdAt: Date.now(),
  }

  // FIFO: if at max, remove the oldest toast
  const toasts = currentToasts.length >= MAX_TOASTS
    ? currentToasts.slice(currentToasts.length - MAX_TOASTS + 1)
    : currentToasts

  return [...toasts, toast]
}

export const toastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  success: (message, opts) =>
    set((state) => ({ toasts: addToast('success', message, opts, state.toasts) })),

  error: (message, opts) =>
    set((state) => ({ toasts: addToast('error', message, opts, state.toasts) })),

  info: (message, opts) =>
    set((state) => ({ toasts: addToast('info', message, opts, state.toasts) })),

  warning: (message, opts) =>
    set((state) => ({ toasts: addToast('warning', message, opts, state.toasts) })),

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clearAll: () => set({ toasts: [] }),
}))

// Named exports for convenient direct access outside React tree
export const toast = {
  success: (message: string, opts?: ToastOpts) =>
    toastStore.getState().success(message, opts),
  error: (message: string, opts?: ToastOpts) =>
    toastStore.getState().error(message, opts),
  info: (message: string, opts?: ToastOpts) =>
    toastStore.getState().info(message, opts),
  warning: (message: string, opts?: ToastOpts) =>
    toastStore.getState().warning(message, opts),
  dismiss: (id: string) => toastStore.getState().dismiss(id),
  clearAll: () => toastStore.getState().clearAll(),
}
