'use client'

import {
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  useId,
} from 'react'
import styles from './Modal.module.css'

type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: ModalSize
}

/* Collect all focusable elements within a container */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest('[hidden]') && !el.closest('[inert]')
  )
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const isClosingRef = useRef(false)

  /* Close with exit animation */
  const close = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog || isClosingRef.current) return
    isClosingRef.current = true
    dialog.classList.add(styles.closing)

    const panel = dialog.querySelector(`.${styles.panel}`)
    const exitDuration = 200

    const finish = () => {
      dialog.classList.remove(styles.closing)
      dialog.close()
      isClosingRef.current = false
      onClose()
    }

    if (panel) {
      panel.addEventListener('animationend', finish, { once: true })
      // Fallback in case animation doesn't fire (reduced motion)
      setTimeout(finish, exitDuration + 50)
    } else {
      finish()
    }
  }, [onClose])

  /* Open / close dialog */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        dialog.showModal()
        isClosingRef.current = false
      }
    } else {
      if (dialog.open && !isClosingRef.current) {
        close()
      }
    }
  }, [open, close])

  /* Body scroll lock */
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.top = `-${scrollY}px`
      return () => {
        const top = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.top = ''
        window.scrollTo(0, parseInt(top || '0') * -1)
      }
    }
  }, [open])

  /* Escape key */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      close()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [close])

  /* Click on backdrop */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) close()
    },
    [close]
  )

  /* Focus trap */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = getFocusable(dialog)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    []
  )

  const panelClass = [styles.panel, styles[size]].join(' ')

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={title ? titleId : undefined}
      aria-modal="true"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className={panelClass}>
        {title && (
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={close}
              aria-label="Stäng dialog"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  )
}
