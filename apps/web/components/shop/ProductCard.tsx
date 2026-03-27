'use client'

import { m } from 'motion/react'
import { springs, slideUp } from '@/lib/motion'
import Link from 'next/link'
import styles from './ProductCard.module.css'

export interface Product {
  id: string
  title: string
  price: number
  currency: string
  sellerName: string
  imageUrl?: string
  category?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <m.article
      className={styles.card}
      variants={slideUp}
      transition={springs.soft}
      whileHover={{ y: -3, transition: springs.default }}
    >
      <Link href={`/shop/${product.id}`} className={styles.link} aria-label={`${product.title} — ${product.price} ${product.currency}`}>
        <div className={styles.imageWrapper} aria-hidden="true">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                <circle cx="14" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 28l9-8 6 6 5-5 12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        <div className={styles.content}>
          {product.category && (
            <span className={styles.category}>{product.category}</span>
          )}
          <h3 className={styles.title}>{product.title}</h3>
          <div className={styles.footer}>
            <span className={styles.sellerName}>{product.sellerName}</span>
            <span className={styles.price}>
              {product.price} <span className={styles.currency}>{product.currency}</span>
            </span>
          </div>
        </div>
      </Link>
    </m.article>
  )
}
