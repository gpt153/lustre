'use client'

import { useState, useEffect, useCallback } from 'react'
import { m } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import Input from '@/components/common/Input'
import ProductCard from '@/components/shop/ProductCard'
import type { Product } from '@/components/shop/ProductCard'
import Skeleton from '@/components/common/Skeleton'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Handgjord silkesmask för ögon',
    price: 349,
    currency: 'kr',
    sellerName: 'LuxeSense Studio',
    category: 'Accessoarer',
  },
  {
    id: 'p2',
    title: 'Aromaterapi massageolja — Ros & Sandelträ',
    price: 229,
    currency: 'kr',
    sellerName: 'BodyBliss',
    category: 'Välmående',
  },
  {
    id: 'p3',
    title: 'Sammetsbindningar set — kopparfärgat',
    price: 599,
    currency: 'kr',
    sellerName: 'VelvetCraft',
    category: 'Accessoarer',
  },
  {
    id: 'p4',
    title: 'Stämningssättande ljusset — Ambar & Ylang',
    price: 189,
    currency: 'kr',
    sellerName: 'Sensorium',
    category: 'Inredning',
  },
  {
    id: 'p5',
    title: 'Parspel — Intimitetskort för par',
    price: 275,
    currency: 'kr',
    sellerName: 'PlayfulMinds',
    category: 'Spel & lek',
  },
  {
    id: 'p6',
    title: 'Ekologisk body lotion — Vetiver & Cedar',
    price: 315,
    currency: 'kr',
    sellerName: 'NaturaSensual',
    category: 'Välmående',
  },
]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await api.shop.product.list.query({})
      setProducts(result?.length ? result : MOCK_PRODUCTS)
    } catch {
      setProducts(MOCK_PRODUCTS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filtered = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <m.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={springs.soft}
        >
          <h1 className={styles.heading}>Marknadsplats</h1>
          <p className={styles.subheading}>Utvalda produkter från betrodda säljare</p>
        </m.div>
      </header>

      <m.div
        className={styles.searchBar}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.08 }}
      >
        <div className={styles.searchIcon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <Input
          type="search"
          placeholder="Sök produkter, säljare eller kategori…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Sök i marknadsplatsen"
          className={styles.searchInput}
        />
      </m.div>

      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton height={180} borderRadius={12} />
                <div style={{ padding: '12px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton height={12} width="40%" borderRadius={6} />
                  <Skeleton height={16} width="85%" borderRadius={6} />
                  <Skeleton height={14} width="60%" borderRadius={6} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <m.div
            className={styles.empty}
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <p className={styles.emptyText}>
              {searchQuery ? `Inga produkter matchade "${searchQuery}"` : 'Inga produkter tillgängliga just nu.'}
            </p>
          </m.div>
        ) : (
          <m.div
            className={styles.grid}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </m.div>
        )}
      </main>
    </div>
  )
}
