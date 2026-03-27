'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { trpc } from '@lustre/api'
import styles from './PostComposer.module.css'

const MAX_CHARS = 2000
const MAX_PHOTOS = 4

interface PostComposerProps {
  onSuccess?: () => void
}

export function PostComposer({ onSuccess }: PostComposerProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createPost = trpc.post.create.useMutation()

  const autoGrow = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 300)}px`
  }, [])

  useEffect(() => {
    autoGrow()
  }, [text, autoGrow])

  const handleFocus = () => setIsFocused(true)

  const handleBlur = () => {
    // Keep expanded if there's content or photos
    if (!text.trim() && photos.length === 0) {
      setIsFocused(false)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_PHOTOS - photos.length
    const newFiles = files.slice(0, remaining)
    setPhotos((prev) => [...prev, ...newFiles])
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
    setPhotoPreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed && photos.length === 0) return
    if (trimmed.length > MAX_CHARS) return

    setUploading(true)
    try {
      const post = await createPost.mutateAsync({ text: trimmed || undefined })

      if (photos.length > 0 && post?.id) {
        for (const photo of photos) {
          const formData = new FormData()
          formData.append('file', photo)
          await fetch(`/api/posts/upload?postId=${post.id}`, {
            method: 'POST',
            body: formData,
          })
        }
      }

      setText('')
      photoPreviews.forEach((url) => URL.revokeObjectURL(url))
      setPhotos([])
      setPhotoPreviews([])
      setIsFocused(false)
      onSuccess?.()
    } catch {
      // error stays visible via button disabled state
    } finally {
      setUploading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isOverLimit = text.length > MAX_CHARS
  const canSubmit = (text.trim().length > 0 || photos.length > 0) && !isOverLimit && !uploading

  return (
    <div className={`${styles.composer} ${isFocused ? styles.composerExpanded : ''}`}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        placeholder="Vad tänker du på?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows={isFocused ? 3 : 1}
        aria-label="Skriv ett inlägg"
      />

      {isFocused && (
        <>
          {/* Photo previews */}
          {photoPreviews.length > 0 && (
            <div className={styles.photoGrid}>
              {photoPreviews.map((src, i) => (
                <div key={i} className={styles.photoThumb}>
                  <Image
                    src={src}
                    alt={`Förhandsgranskning ${i + 1}`}
                    fill
                    sizes="120px"
                    className={styles.photoThumbImg}
                  />
                  <button
                    className={styles.removePhoto}
                    onClick={() => removePhoto(i)}
                    aria-label={`Ta bort bild ${i + 1}`}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button
                type="button"
                className={styles.photoButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= MAX_PHOTOS}
                aria-label="Lägg till foto"
                title="Lägg till foto"
              >
                <span aria-hidden="true">🖼</span>
                {photos.length > 0 && (
                  <span className={styles.photoCount}>{photos.length}/{MAX_PHOTOS}</span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className={styles.hiddenInput}
                onChange={handlePhotoSelect}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>

            <div className={styles.toolbarRight}>
              <span
                className={`${styles.charCount} ${isOverLimit ? styles.charCountOver : ''}`}
                aria-live="polite"
                aria-label={`${text.length} av ${MAX_CHARS} tecken`}
              >
                {text.length}/{MAX_CHARS}
              </span>
              <button
                type="button"
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-label="Publicera inlägg"
              >
                {uploading ? (
                  <span className={styles.spinner} aria-hidden="true" />
                ) : (
                  'Publicera'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
