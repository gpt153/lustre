'use client'

import { useState, useEffect, use } from 'react'
import { m } from 'motion/react'
import { springs, slideUp, fadeIn } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Skeleton from '@/components/common/Skeleton'
import Link from 'next/link'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

interface ProductDetail {
  id: string
  title: string
  price: number
  currency: string
  description: string
  sellerName: string
  sellerBio?: string
  category?: string
  imageUrls: string[]
}

const MOCK_PRODUCTS: Record<string, ProductDetail> = {
  p1: {
    id: 'p1',
    title: 'Handgjord silkesmask för ögon',
    price: 349,
    currency: 'kr',
    description: 'En handgjord silkesmask i lyxigt 100% natursilke. Perfekt för sensuella kvällar eller avkoppling. Bekväm passform med mjuk elastisk rem. Finns i svart och koppar.',
    sellerName: 'LuxeSense Studio',
    sellerBio: 'Handgjorda accessoarer med fokus på lyx och sinnlighet sedan 2021.',
    category: 'Accessoarer',
    imageUrls: [],
  },
  p2: {
    id: 'p2',
    title: 'Aromaterapi massageolja — Ros & Sandelträ',
    price: 229,
    currency: 'kr',
    description: 'En varsamt blandad massageolja med eteriska oljor av ros och sandelträ. Kall-pressad mandelolja som bas. Passar perfekt för avkopplande massage och hudvård.',
    sellerName: 'BodyBliss',
    sellerBio: 'Naturliga hudvårdsprodukter framtagna för välmående och njutning.',
    category: 'Välmående',
    imageUrls: [],
  },
  default: {
    id: 'default',
    title: 'Utforska vår kollektion',
    price: 299,
    currency: 'kr',
    description: 'En noggrant utvald produkt från en av våra betrodda säljare. Alla produkter på Lustre Marknadsplats genomgår en kvalitetsgranskning innan publicering.',
    sellerName: 'Lustre Butik',
    sellerBio: 'Betrodda säljare på Lustre — verifierade och recenserade av gemenskapen.',
    category: 'Övrigt',
    imageUrls: [],
  },
}

interface Props {
  params: Promise<{ productId: string }>
}

export default function ProductDetailPage({ params }: Props) {
  const { productId } = use(params)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const result = await api.shop.product.get.query({ id: productId })
        setProduct(result ?? MOCK_PRODUCTS[productId] ?? MOCK_PRODUCTS.default)
      } catch {
        setProduct(MOCK_PRODUCTS[productId] ?? MOCK_PRODUCTS.default)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [productId])

  const handleBuy = () => {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>
          <Skeleton height={14} width={120} borderRadius={6} />
        </div>
        <div className={styles.layout}>
          <div className={styles.gallery}>
            <Skeleton height={380} borderRadius={16} />
          </div>
          <div className={styles.details}>
            <Skeleton height={12} width={80} borderRadius={6} />
            <div style={{ marginTop: 12 }}>
              <Skeleton height={28} width="85%" borderRadius={8} />
            </div>
            <div style={{ marginTop: 8 }}>
              <Skeleton height={28} width="35%" borderRadius={8} />
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton height={14} borderRadius={6} />
              <Skeleton height={14} borderRadius={6} />
              <Skeleton height={14} width="70%" borderRadius={6} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const hasImages = product.imageUrls.length > 0

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Navigering">
        <Link href="/shop" className={styles.breadcrumbLink}>
          Marknadsplats
        </Link>
        <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
        <span className={styles.breadcrumbCurrent}>{product.title}</span>
      </nav>

      <m.div
        className={styles.layout}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={springs.soft}
      >
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {hasImages ? (
              <img
                src={product.imageUrls[activeImage]}
                alt={`${product.title} — bild ${activeImage + 1}`}
                className={styles.mainImageEl}
              />
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden="true">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="6" y="6" width="52" height="52" rx="10" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
                  <circle cx="22" cy="24" r="5" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 44l14-13 10 10 8-8 20 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Produktbild saknas</span>
              </div>
            )}
          </div>

          {hasImages && product.imageUrls.length > 1 && (
            <div className={styles.thumbnails} role="tablist" aria-label="Produktbilder">
              {product.imageUrls.map((url, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${activeImage === i ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                  role="tab"
                  aria-selected={activeImage === i}
                  aria-label={`Bild ${i + 1}`}
                >
                  <img src={url} alt="" className={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <m.div
          className={styles.details}
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ ...springs.soft, delay: 0.1 }}
        >
          {product.category && (
            <span className={styles.category}>{product.category}</span>
          )}
          <h1 className={styles.title}>{product.title}</h1>
          <p className={styles.price}>
            {product.price} <span className={styles.currency}>{product.currency}</span>
          </p>

          <p className={styles.description}>{product.description}</p>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleBuy}
            className={styles.buyButton}
            aria-live="polite"
          >
            {addedToCart ? '✓ Lagd i varukorg' : 'Köp'}
          </Button>

          {/* Seller card */}
          <Card className={styles.sellerCard}>
            <div className={styles.sellerContent}>
              <div className={styles.sellerAvatar} aria-hidden="true">
                {product.sellerName.charAt(0)}
              </div>
              <div className={styles.sellerInfo}>
                <p className={styles.sellerLabel}>Säljs av</p>
                <p className={styles.sellerName}>{product.sellerName}</p>
                {product.sellerBio && (
                  <p className={styles.sellerBio}>{product.sellerBio}</p>
                )}
              </div>
            </div>
          </Card>
        </m.div>
      </m.div>
    </div>
  )
}
