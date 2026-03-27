'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './MediaGallery.module.css'

interface MediaItem {
  url: string
  alt?: string
  width?: number
  height?: number
}

interface MediaGalleryProps {
  items: MediaItem[]
  postId: string
}

export default function MediaGallery({ items, postId }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showArrows, setShowArrows] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const hasMultiple = items.length > 1

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current
      if (!track) return
      const clamped = Math.max(0, Math.min(index, items.length - 1))
      track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
      setActiveIndex(clamped)
    },
    [items.length]
  )

  const handleScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => track.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (items.length === 0) return null

  return (
    <div
      className={styles.gallery}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <div
        ref={trackRef}
        className={styles.track}
        role="list"
        aria-label={`Mediagalleri med ${items.length} bilder`}
      >
        {items.map((item, i) => (
          <div
            key={`${postId}-media-${i}`}
            className={styles.slide}
            role="listitem"
          >
            <img
              src={item.url}
              alt={item.alt ?? `Bild ${i + 1} av ${items.length}`}
              className={styles.image}
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {hasMultiple && showArrows && (
        <>
          {activeIndex > 0 && (
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Föregående bild"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {activeIndex < items.length - 1 && (
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Nästa bild"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </>
      )}

      {hasMultiple && (
        <div className={styles.dots} role="tablist" aria-label="Bildnavigering">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Gå till bild ${i + 1}`}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
