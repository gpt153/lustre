import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant) => string
  removeToast: (id: string) => void
}

let counter = 0

function generateId(): string {
  counter += 1
  return `toast-${Date.now()}-${counter}`
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message: string, variant: ToastVariant = 'info'): string => {
    const id = generateId()
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }],
    }))
    return id
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

/* Convenience helpers callable outside React components */

export function addToast(message: string, variant?: ToastVariant): string {
  return useToastStore.getState().addToast(message, variant)
}

export function removeToast(id: string): void {
  useToastStore.getState().removeToast(id)
}
