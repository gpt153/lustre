'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import styles from './PhotoGrid.module.css'

export interface PhotoItem {
  id: string
  url: string
}

interface PhotoGridProps {
  photos: PhotoItem[]
  onChange: (photos: PhotoItem[]) => void
  maxPhotos?: number
}

export function PhotoGrid({ photos, onChange, maxPhotos = 6 }: PhotoGridProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addAtIndexRef = useRef<number>(-1)

  const slots = Array.from({ length: maxPhotos }, (_, i) => photos[i] ?? null)

  function handleDragStart(id: string) {
    setDraggingId(id)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setOverIndex(index)
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    if (draggingId === null) return

    const dragIndex = photos.findIndex((p) => p.id === draggingId)
    if (dragIndex === -1 || dragIndex === dropIndex) {
      setDraggingId(null)
      setOverIndex(null)
      return
    }

    const next = [...photos]
    const [item] = next.splice(dragIndex, 1)
    next.splice(dropIndex, 0, item)
    onChange(next)
    setDraggingId(null)
    setOverIndex(null)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setOverIndex(null)
  }

  function handleAddClick(index: number) {
    addAtIndexRef.current = index
    fileInputRef.current?.click()
  }

  function handleRemove(id: string) {
    onChange(photos.filter((p) => p.id !== id))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const newPhoto: PhotoItem = { id: `local-${Date.now()}`, url }
    const idx = addAtIndexRef.current
    if (idx >= 0 && idx < photos.length) {
      const next = [...photos]
      next.splice(idx, 0, newPhoto)
      onChange(next.slice(0, maxPhotos))
    } else {
      onChange([...photos, newPhoto].slice(0, maxPhotos))
    }
    e.target.value = ''
  }

  return (
    <div className={styles.photoGrid}>
      {slots.map((photo, index) => {
        const isDragging = photo?.id === draggingId
        const isOver = overIndex === index && draggingId !== null

        if (photo) {
          return (
            <div
              key={photo.id}
              className={[
                styles.photoSlot,
                isDragging ? styles.photoSlotDragging : '',
                isOver ? styles.photoSlotOver : '',
              ]
                .filter(Boolean)
                .join(' ')}
              draggable
              onDragStart={() => handleDragStart(photo.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <Image
                src={photo.url}
                alt={`Photo ${index + 1}`}
                fill
                sizes="160px"
                className={styles.photo}
                style={{ objectFit: 'cover' }}
              />
              <button
                className={styles.removeButton}
                onClick={() => handleRemove(photo.id)}
                aria-label={`Remove photo ${index + 1}`}
                type="button"
              >
                ✕
              </button>
              <div className={styles.dragHandle} aria-hidden="true" />
            </div>
          )
        }

        return (
          <div
            key={`empty-${index}`}
            className={[
              styles.photoSlot,
              styles.photoSlotEmpty,
              isOver ? styles.photoSlotOver : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleAddClick(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            role="button"
            tabIndex={0}
            aria-label={`Add photo ${index + 1}`}
            onKeyDown={(e) => e.key === 'Enter' && handleAddClick(index)}
          >
            <span className={styles.addPhotoIcon} aria-hidden="true">
              +
            </span>
          </div>
        )
      })}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  )
}
