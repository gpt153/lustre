'use client'

import { useState, useCallback, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import styles from './PhotoGallery.module.css'

interface Photo {
  id: string
  url: string
  alt?: string
}

interface PhotoGalleryProps {
  photos: Photo[]
  editable?: boolean
  onReorder?: (photoIds: string[]) => void
  onUpload?: (files: FileList) => void
}

function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="26" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="17" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 8l2-3h6l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PhotoGallery({ photos, editable = false, onUpload }: Omit<PhotoGalleryProps, 'onReorder'>) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i > 0 ? i - 1 : photos.length - 1))
  }, [photos.length])

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i < photos.length - 1 ? i + 1 : 0))
  }, [photos.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, goPrev, goNext])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (onUpload && e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files)
      }
    },
    [onUpload]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onUpload && e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files)
      }
    },
    [onUpload]
  )

  const maxSlots = 6
  const slots = Array.from({ length: maxSlots }, (_, i) => photos[i] ?? null)

  const activePhoto = photos[lightboxIndex]

  return (
    <>
      <ul className={styles.grid} role="list" aria-label="Profilfoton">
        {slots.map((photo, index) => {
          const isFirst = index === 0
          const isEmpty = !photo

          if (isEmpty && editable && index < photos.length + 1) {
            return (
              <li
                key={`slot-${index}`}
                className={`${styles.cell} ${isFirst ? styles.cellFirst : ''} ${styles.uploadSlot} ${dragOver && isFirst ? styles.dragOver : ''}`}
                role="listitem"
              >
                <label
                  className={styles.uploadLabel}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  aria-label="Lägg till foto"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.fileInput}
                    onChange={handleFileInput}
                  />
                  <span className={styles.uploadIcon}>
                    <CameraIcon />
                  </span>
                  <span className={styles.uploadText}>Lägg till foto</span>
                </label>
              </li>
            )
          }

          if (isEmpty) {
            return (
              <li
                key={`empty-${index}`}
                className={`${styles.cell} ${isFirst ? styles.cellFirst : ''} ${styles.emptyCell}`}
                role="listitem"
                aria-label="Tomt fotoslot"
              >
                <span className={styles.emptyIcon}>
                  <CameraIcon />
                </span>
              </li>
            )
          }

          return (
            <li
              key={photo.id}
              className={`${styles.cell} ${isFirst ? styles.cellFirst : ''}`}
              role="listitem"
            >
              <button
                type="button"
                className={styles.photoButton}
                onClick={() => openLightbox(index)}
                aria-label={`Visa foto ${index + 1} i fullskärm`}
              >
                <img
                  src={photo.url}
                  alt={photo.alt ?? `Foto ${index + 1}`}
                  className={styles.photo}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </button>
            </li>
          )
        })}
      </ul>

      <Modal open={lightboxOpen} onClose={closeLightbox} size="lg">
        {activePhoto && (
          <div className={styles.lightbox}>
            <img
              src={activePhoto.url}
              alt={activePhoto.alt ?? `Foto ${lightboxIndex + 1}`}
              className={styles.lightboxImage}
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                  onClick={goPrev}
                  aria-label="Föregående foto"
                >
                  <ArrowLeftIcon />
                </button>
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                  onClick={goNext}
                  aria-label="Nästa foto"
                >
                  <ArrowRightIcon />
                </button>
              </>
            )}
            <div className={styles.lightboxDots} aria-hidden="true">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot} ${i === lightboxIndex ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
