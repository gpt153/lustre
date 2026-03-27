'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useToastStore, Toast as ToastType, ToastVariant } from '@/lib/toast-store'
import styles from './Toast.module.css'

const AUTO_DISMISS_MS = 5000

/* ---- Icons ---- */

function SuccessIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 7L7 13M7 7l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5L18 17H2L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 9v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

const ICONS: Record<ToastVariant, () => JSX.Element> = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ---- Single Toast item ---- */

interface ToastItemProps {
  toast: ToastType
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)
  const removedRef = useRef(false)

  const dismiss = useCallback(() => {
    if (removedRef.current) return
    const el = itemRef.current
    if (!el) {
      onRemove(toast.id)
      return
    }
    el.classList.add(styles.exiting)
    el.addEventListener(
      'animationend',
      () => {
        removedRef.current = true
        onRemove(toast.id)
      },
      { once: true }
    )
    // Fallback
    setTimeout(() => {
      if (!removedRef.current) {
        removedRef.current = true
        onRemove(toast.id)
      }
    }, 300)
  }, [toast.id, onRemove])

  /* Auto-dismiss after 5s */
  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [dismiss])

  const Icon = ICONS[toast.variant]

  return (
    <div
      ref={itemRef}
      className={`${styles.toast} ${styles[toast.variant]}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <Icon />
      <p className={styles.message}>{toast.message}</p>
      <button
        type="button"
        className={styles.dismiss}
        onClick={dismiss}
        aria-label="Stäng notifikation"
      >
        <CloseIcon />
      </button>
      <span className={styles.progress} aria-hidden="true" />
    </div>
  )
}

/* ---- ToastContainer ---- */

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className={styles.container} aria-label="Notifikationer">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

/* Default export is the container, named exports for store access */
export default ToastContainer
