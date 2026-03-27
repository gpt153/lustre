'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

interface ModalProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen || !mounted) return

    previouslyFocusedElement.current = document.activeElement as HTMLElement

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleOverlayClick = (e: MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    if (overlayRef.current) {
      overlayRef.current.addEventListener('click', handleOverlayClick)
    }

    focusFirstElement()
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      if (overlayRef.current) {
        overlayRef.current.removeEventListener('click', handleOverlayClick)
      }
      document.body.style.overflow = ''
      previouslyFocusedElement.current?.focus()
    }
  }, [isOpen, mounted, onClose])

  const focusFirstElement = () => {
    if (!modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      ;(focusableElements[0] as HTMLElement).focus()
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className={styles.overlay} ref={overlayRef} role="presentation">
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle} id="modal-title">
              {title}
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
