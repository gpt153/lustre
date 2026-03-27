'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './ProductCard.module.css'

export interface ProductCardProps {
  id: string
  title: string
  price: number
  category: string
  sellerName: string
  images: Array<{ url: string; blurhash?: string }>
  href: string
}

export function ProductCard({
  id,
  title,
  price,
  category,
  sellerName,
  images,
  href,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const primaryImage = images[0]
  const secondaryImage = images[1]

  return (
    <Link href={href} className={styles.productCard}>
      <div className={styles.imageContainer}>
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={title}
            width={400}
            height={400}
            className={styles.productImage}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        )}
        {secondaryImage && (
          <Image
            src={secondaryImage.url}
            alt={`${title} - variant`}
            width={400}
            height={400}
            className={styles.productImageSecondary}
            loading="lazy"
            sizes="(max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        )}
      </div>

      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{title}</h3>

        <div className={styles.priceTag}>
          <p className={styles.productPrice}>{Math.round(price)} kr</p>
          <div className={styles.priceGlow} />
        </div>

        <span className={styles.categoryTag}>{category}</span>

        <div className={styles.sellerInfo}>
          <p className={styles.sellerName}>{sellerName || 'Anonym'}</p>
        </div>
      </div>
    </Link>
  )
}
