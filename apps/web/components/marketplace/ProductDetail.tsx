'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './ProductDetail.module.css'
import { Button } from '@/components/common/Button'

export interface ProductDetailProps {
  id: string
  title: string
  price: number
  description: string
  category: string
  sellerName: string
  images: Array<{ url: string; blurhash?: string }>
  onBuy?: () => void
  isLoading?: boolean
}

export function ProductDetail({
  id,
  title,
  price,
  description,
  category,
  sellerName,
  images,
  onBuy,
  isLoading,
}: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const selectedImage = images[selectedImageIndex]

  return (
    <div className={styles.detailContainer}>
      <div className={styles.gallery}>
        {selectedImage && (
          <Image
            key={selectedImageIndex}
            src={selectedImage.url}
            alt={title}
            width={600}
            height={600}
            className={styles.mainImage}
            loading="lazy"
            sizes="(max-width: 900px) 90vw, (max-width: 1400px) 45vw, 600px"
          />
        )}

        {images.length > 1 && (
          <div className={styles.thumbnailRow}>
            {images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`${styles.thumbnail} ${idx === selectedImageIndex ? styles.thumbnailActive : ''}`}
                aria-label={`Select image ${idx + 1}`}
              >
                <Image
                  src={image.url}
                  alt={`${title} thumbnail ${idx + 1}`}
                  width={72}
                  height={72}
                  sizes="72px"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.detailContent}>
        <h1 className={styles.detailTitle}>{title}</h1>
        <p className={styles.detailPrice}>{Math.round(price)} kr</p>

        {description && <p className={styles.description}>{description}</p>}

        <div className={styles.sellerCard}>
          <p className={styles.sellerLabel}>Säljare</p>
          <p className={styles.sellerName}>{sellerName || 'Anonym'}</p>
        </div>

        <button
          onClick={onBuy}
          disabled={isLoading}
          className={styles.buyButton}
          aria-label={`Buy ${title}`}
        >
          {isLoading ? 'Laddar...' : 'Köp'}
        </button>
      </div>
    </div>
  )
}
