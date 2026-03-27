'use client'

import { useState, useRef, useCallback, ChangeEvent } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { addToast } from '@/lib/toast-store'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { api as _api } from '@/lib/trpc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import styles from './PostComposer.module.css'

interface PostComposerProps {
  open: boolean
  onClose: () => void
  onPostCreated?: () => void
}

const MAX_CHARS = 500

export default function PostComposer({ open, onClose, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0
  const isEmpty = content.trim().length === 0

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    autoResize()
  }

  const handleClose = () => {
    if (isPublishing) return
    setContent('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onClose()
  }

  const handlePublish = async () => {
    if (isEmpty || isOverLimit || isPublishing) return
    setIsPublishing(true)
    try {
      await api.post.create.mutate({ content: content.trim(), mode: 'vanilla' })
      addToast('Inlägg publicerat!', 'success')
      setContent('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      onPostCreated?.()
      onClose()
    } catch {
      addToast('Kunde inte publicera inlägget. Försök igen.', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    // File upload via REST endpoint handled in future iteration
    addToast('Bilduppladdning kommer snart!', 'info')
  }

  return (
    <Modal open={open} onClose={handleClose} title="Skapa inlägg" size="md">
      <div className={styles.composer}>
        <div className={styles.textareaWrap}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Vad tänker du på?"
            value={content}
            onChange={handleChange}
            rows={4}
            maxLength={MAX_CHARS + 50}
            aria-label="Inläggstext"
            aria-describedby="char-count"
            disabled={isPublishing}
          />
          <div
            id="char-count"
            className={`${styles.charCount} ${remaining < 50 ? styles.charCountWarning : ''} ${isOverLimit ? styles.charCountOver : ''}`}
          >
            {remaining}
          </div>
        </div>

        <div
          className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Lägg till bilder (dra och släpp eller klicka)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              addToast('Bilduppladdning kommer snart!', 'info')
            }
          }}
        >
          <div className={styles.dropZoneIcon} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className={styles.dropZoneText}>
            Dra bilder hit eller{' '}
            <span className={styles.dropZoneLink}>välj filer</span>
          </span>
          <span className={styles.dropZoneHint}>Stöd för JPEG, PNG, WebP</span>
        </div>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isPublishing}
          >
            Avbryt
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            loading={isPublishing}
            disabled={isEmpty || isOverLimit}
            aria-label="Publicera inlägg"
          >
            Publicera
          </Button>
        </div>
      </div>
    </Modal>
  )
}
