'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import styles from './Toast.module.css'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  message: string
  variant: ToastVariant
  isExiting: boolean
}

interface ToastContextType {
  toast: (message: string, variant: ToastVariant) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastItem({
  id,
  message,
  variant,
  isExiting,
  onRemove,
}: ToastMessage & { onRemove: (id: string) => void }) {
  const accentClass =
    variant === 'success'
      ? styles.accentSuccess
      : variant === 'error'
        ? styles.accentError
        : styles.accentInfo

  const toastClass = [styles.toast, accentClass, isExiting && styles.toastExiting]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={toastClass} role="status" aria-live="polite">
      <span className={styles.toastMessage}>{message}</span>
      <button
        className={styles.toastClose}
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return createPortal(
    <div className={styles.toastContainer} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onRemove={onRemove}
        />
      ))}
    </div>,
    document.body
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const idRef = useRef(0)
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    )

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
      delete timeoutsRef.current[id]
    }, 200)

    timeoutsRef.current[id] = timeout
  }, [])

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = String(idRef.current++)
      const newToast: ToastMessage = {
        id,
        message,
        variant,
        isExiting: false,
      }

      setToasts((prev) => [...prev, newToast])

      const timeout = setTimeout(() => {
        removeToast(id)
      }, 4000)

      timeoutsRef.current[id] = timeout
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

