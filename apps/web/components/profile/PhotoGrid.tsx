'use client'

import PolaroidCard from '@/components/common/PolaroidCard'
import styles from './PhotoGrid.module.css'

export interface PhotoItem {
  id: string
  url: string
  alt: string
  caption?: string
}

interface PhotoGridProps {
  photos: PhotoItem[]
  maxSlots?: number
  onAddPhoto?: () => void
  onEditPhoto?: (id: string) => void
  onDeletePhoto?: (id: string) => void
}

export default function PhotoGrid({
  photos,
  maxSlots = 6,
  onAddPhoto,
  onEditPhoto,
  onDeletePhoto,
}: PhotoGridProps) {
  const filledCount = photos.length
  const emptyCount = maxSlots - filledCount

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2>Your Gallery</h2>
          <p>Drag and drop to reorder your memories.</p>
        </div>
        <span className={styles.photoCounter}>
          {filledCount} / {maxSlots} photos
        </span>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* Featured photo (first) */}
        {photos.length > 0 && (
          <div className={styles.featured}>
            <div className={styles.featuredCard}>
              <PolaroidCard
                imageUrl={photos[0].url}
                imageAlt={photos[0].alt}
                caption={photos[0].caption ?? 'Profile Masterpiece'}
                rotation={1}
                hoverable
              />
              <div className={styles.photoOverlay}>
                <button
                  className={styles.overlayBtn}
                  onClick={() => onEditPhoto?.(photos[0].id)}
                  aria-label="Edit photo"
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  className={styles.overlayBtnDelete}
                  onClick={() => onDeletePhoto?.(photos[0].id)}
                  aria-label="Delete photo"
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* If no photos, show first slot as empty featured */}
        {photos.length === 0 && (
          <div
            className={styles.emptySlot}
            style={{ gridColumn: 'span 2' }}
            onClick={onAddPhoto}
            role="button"
            tabIndex={0}
            aria-label="Add featured photo"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onAddPhoto?.()
              }
            }}
          >
            <span className={styles.emptyIcon} aria-hidden="true">+</span>
            <span className={styles.emptyText}>Add Photo</span>
          </div>
        )}

        {/* Regular photos (2nd onward) */}
        {photos.slice(1).map((photo) => (
          <div key={photo.id} className={styles.regularSlot}>
            <PolaroidCard
              imageUrl={photo.url}
              imageAlt={photo.alt}
              caption={photo.caption}
              hoverable
            />
            <div className={styles.photoOverlay}>
              <button
                className={styles.overlayBtn}
                onClick={() => onEditPhoto?.(photo.id)}
                aria-label={`Edit photo ${photo.alt}`}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                className={styles.overlayBtnDelete}
                onClick={() => onDeletePhoto?.(photo.id)}
                aria-label={`Delete photo ${photo.alt}`}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: emptyCount - (photos.length === 0 ? 1 : 0) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className={styles.emptySlot}
            onClick={onAddPhoto}
            role="button"
            tabIndex={0}
            aria-label="Add photo"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onAddPhoto?.()
              }
            }}
          >
            <span className={styles.emptyIcon} aria-hidden="true">+</span>
            <span className={styles.emptyText}>Add Photo</span>
          </div>
        ))}
      </div>
    </div>
  )
}
