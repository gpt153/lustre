import PolaroidCard from '@/components/common/PolaroidCard'
import styles from './ScatteredGallery.module.css'

export interface GalleryPhoto {
  url: string
  alt: string
  caption?: string
}

interface ScatteredGalleryProps {
  photos: GalleryPhoto[]
  className?: string
}

/**
 * ScatteredGallery — Scattered Polaroid gallery with perspective.
 * Expects 1-5 photos: first is the hero (center, largest), the rest scatter around it.
 */
export default function ScatteredGallery({ photos, className }: ScatteredGalleryProps) {
  if (photos.length === 0) return null

  const [hero, ...surrounding] = photos
  const cardClasses = [styles.card0, styles.card1, styles.card2, styles.card3]

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      {/* Surrounding cards rendered first so hero stacks on top */}
      {surrounding.slice(0, 4).map((photo, i) => (
        <div key={i} className={`${styles.polaroid} ${cardClasses[i]}`}>
          <PolaroidCard
            imageUrl={photo.url}
            imageAlt={photo.alt}
            caption={photo.caption}
            hoverable
          />
        </div>
      ))}

      {/* Hero card — center, largest */}
      <div className={`${styles.polaroid} ${styles.hero}`}>
        <PolaroidCard
          imageUrl={hero.url}
          imageAlt={hero.alt}
          caption={hero.caption}
          hoverable
        />
      </div>
    </div>
  )
}
