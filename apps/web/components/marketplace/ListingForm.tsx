'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import styles from './ListingForm.module.css'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

export interface ListingFormProps {
  onSubmit: (data: {
    title: string
    description: string
    price: number
    category: string
    images: File[]
  }) => Promise<void>
  onCancel?: () => void
  categories: Array<{ key: string; label: string }>
  isLoading?: boolean
}

export function ListingForm({
  onSubmit,
  onCancel,
  categories,
  isLoading,
}: ListingFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(categories[0]?.key || '')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const addImages = useCallback((files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - images.length)

    newFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviews((p) => [...p, e.target.result as string])
        }
      }
      reader.readAsDataURL(file)
    })

    setImages((p) => [...p, ...newFiles])
  }, [images.length])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(e.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
  }

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    if (e.dataTransfer.files) {
      addImages(e.dataTransfer.files)
    }
  }

  const removeImage = (index: number) => {
    setImages((p) => p.filter((_, i) => i !== index))
    setPreviews((p) => p.filter((_, i) => i !== index))
  }

  const reorderImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const newPreviews = [...previews]

    [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]]
    ;[newPreviews[fromIndex], newPreviews[toIndex]] = [newPreviews[toIndex], newPreviews[fromIndex]]

    setImages(newImages)
    setPreviews(newPreviews)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = 'Titel är obligatorisk'
    if (!description.trim()) newErrors.description = 'Beskrivning är obligatorisk'
    if (!price || parseFloat(price) <= 0) newErrors.price = 'Pris måste vara större än 0'
    if (images.length === 0) newErrors.images = 'Minst en bild är obligatorisk'
    if (!category) newErrors.category = 'Kategori är obligatorisk'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        images,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const canAddMore = images.length < 5

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Foton</h2>
        <p className={styles.sectionDescription}>
          Lägg till minst ett foto. Max 5 foton. Du kan dra för att ändra ordning.
        </p>

        <div
          className={styles.dropZone}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={!canAddMore}
            className={styles.fileInput}
          />

          <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v20m-7-7l7-7 7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <p className={styles.dropZoneText}>
            Dra foton här eller <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canAddMore}
              className={styles.browseButton}
            >
              välj från datorn
            </button>
          </p>

          {canAddMore && (
            <p className={styles.dropZoneHint}>
              {5 - images.length} {5 - images.length === 1 ? 'foto' : 'foton'} återstår
            </p>
          )}
        </div>

        {errors.images && <p className={styles.error}>{errors.images}</p>}

        {previews.length > 0 && (
          <div className={styles.imageGrid}>
            {previews.map((preview, idx) => (
              <div
                key={idx}
                className={styles.imageItem}
                draggable
                onDragStart={(e) => (e.dataTransfer?.setData('index', idx.toString()))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const fromIndex = parseInt(e.dataTransfer?.getData('index') || '0')
                  if (fromIndex !== idx) reorderImage(fromIndex, idx)
                }}
              >
                <Image
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  width={120}
                  height={120}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className={styles.removeButton}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Annonsdetaljer</h2>

        <div className={styles.formGroup}>
          <label className={styles.label}>Titel *</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((p) => ({ ...p, title: '' }))
            }}
            placeholder="T.ex. Nya höga skor i storlek 38"
            maxLength={100}
            error={!!errors.title}
          />
          {errors.title && <p className={styles.error}>{errors.title}</p>}
          <p className={styles.charCount}>{title.length}/100</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Beskrivning *</label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (errors.description) setErrors((p) => ({ ...p, description: '' }))
            }}
            placeholder="Beskriv produkten i detalj. Material, skick, mått, etc."
            maxLength={1000}
            className={styles.textarea}
          />
          {errors.description && <p className={styles.error}>{errors.description}</p>}
          <p className={styles.charCount}>{description.length}/1000</p>
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pris (kr) *</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                if (errors.price) setErrors((p) => ({ ...p, price: '' }))
              }}
              placeholder="0"
              min="1"
              step="1"
              error={!!errors.price}
            />
            {errors.price && <p className={styles.error}>{errors.price}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Kategori *</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                if (errors.category) setErrors((p) => ({ ...p, category: '' }))
              }}
              className={styles.select}
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <p className={styles.error}>{errors.category}</p>}
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.secondaryButton}>
            Avbryt
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || isLoading}
          className={styles.primaryButton}
        >
          {submitting || isLoading ? 'Publicerar...' : 'Publicera annons'}
        </button>
      </div>
    </form>
  )
}
