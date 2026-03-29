'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import dynamic from 'next/dynamic'
import PostCard from '@/components/feed/PostCard'
import FeedAdCard from '@/components/feed/FeedAdCard'
import FeedSkeleton from '@/components/feed/FeedSkeleton'
import EmptyState from '@/components/common/EmptyState'
import PolaroidMasonryGrid from '@/components/common/PolaroidMasonryGrid'

const PostComposer = dynamic(() => import('@/components/feed/PostComposer'), { ssr: false })
import styles from './page.module.css'

interface PostItem {
  type: 'post'
  id: string
  author: { id: string; displayName: string; photoUrl?: string }
  content: string
  media: Array<{ url: string; alt?: string }>
  likeCount: number
  commentCount: number
  isLiked: boolean
  createdAt: string
}

interface AdItem {
  type: 'ad'
  campaignId: string
  creativeId: string
  sponsor: string
  headline: string
  body?: string
  imageUrl?: string
  ctaUrl: string
}

type FeedItem = PostItem | AdItem

const MOCK_POSTS: FeedItem[] = [
  {
    type: 'post' as const,
    id: 'p1',
    author: { id: 'u1', displayName: 'Emma', photoUrl: '' },
    content: 'Coffee and quiet thoughts.',
    media: [{ url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop', alt: 'Coffee cup on wooden table' }],
    likeCount: 12,
    commentCount: 4,
    isLiked: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
  },
  {
    type: 'post' as const,
    id: 'p2',
    author: { id: 'u2', displayName: 'Sofia', photoUrl: '' },
    content: 'Chasing the golden hour...',
    media: [{ url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=750&fit=crop', alt: 'Golden hour sunset over field' }],
    likeCount: 28,
    commentCount: 7,
    isLiked: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
  },
  {
    type: 'post' as const,
    id: 'p3',
    author: { id: 'u3', displayName: 'Lina', photoUrl: '' },
    content: 'Getting my hands dirty today.',
    media: [{ url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop', alt: 'Hands working with clay on pottery wheel' }],
    likeCount: 45,
    commentCount: 12,
    isLiked: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
  },
  {
    type: 'post' as const,
    id: 'p4',
    author: { id: 'u4', displayName: 'Alex' },
    content: 'Underbar promenad langs Strandvagen idag. Hosten ar verkligen Stockholms basta arstid.',
    media: [],
    likeCount: 12,
    commentCount: 3,
    isLiked: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
  },
  {
    type: 'post' as const,
    id: 'p5',
    author: { id: 'u5', displayName: 'Maja', photoUrl: '' },
    content: 'The ocean breathes salty air.',
    media: [{ url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop', alt: 'Calm ocean at dawn' }],
    likeCount: 34,
    commentCount: 3,
    isLiked: false,
    createdAt: new Date(Date.now() - 48 * 60 * 60_000).toISOString(),
  },
  {
    type: 'post' as const,
    id: 'p6',
    author: { id: 'u6', displayName: 'Viktor', photoUrl: '' },
    content: 'Rainy Sunday essentials.',
    media: [{ url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop', alt: 'Books by the fireplace' }],
    likeCount: 56,
    commentCount: 15,
    isLiked: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60_000).toISOString(),
  },
  {
    type: 'ad' as const,
    campaignId: 'camp-1',
    creativeId: 'cre-1',
    sponsor: 'Lustre Events',
    headline: 'Mingel & Mys -- Stockholms nya dejtingevent',
    body: 'Traffa likasinnade i en avslappnad miljo. Nasta event: 5 april.',
    imageUrl: '',
    ctaUrl: '/events',
  },
  {
    type: 'post' as const,
    id: 'p7',
    author: { id: 'u7', displayName: 'Elsa', photoUrl: '' },
    content: 'Lost in the peaks.',
    media: [{ url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop', alt: 'Misty mountain peaks at sunrise' }],
    likeCount: 21,
    commentCount: 2,
    isLiked: false,
    createdAt: new Date(Date.now() - 96 * 60 * 60_000).toISOString(),
  },
]

const FEED_TABS = ['Alla', 'Foljer', 'Populart'] as const
type FeedTab = (typeof FEED_TABS)[number]

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [composerOpen, setComposerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<FeedTab>('Alla')
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const loadFeed = useCallback(async (nextCursor?: string) => {
    try {
      const result = await api.post.feed.query({ cursor: nextCursor })
      const newItems: FeedItem[] = result.items ?? result ?? []
      const nextPageCursor = result.nextCursor ?? null
      return { items: newItems, nextCursor: nextPageCursor }
    } catch {
      return { items: MOCK_POSTS, nextCursor: null }
    }
  }, [])

  const initialLoad = useCallback(async () => {
    setIsLoading(true)
    const { items: newItems, nextCursor: newCursor } = await loadFeed()
    if (!isMounted.current) return
    setItems(newItems.length > 0 ? newItems : MOCK_POSTS)
    setCursor(newCursor)
    setHasMore(newCursor !== null)
    setIsLoading(false)
  }, [loadFeed])

  useEffect(() => {
    initialLoad()
  }, [initialLoad])

  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore || !cursor) return
    setIsFetchingMore(true)
    const { items: newItems, nextCursor: newCursor } = await loadFeed(cursor)
    if (!isMounted.current) return
    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems])
      setCursor(newCursor)
      setHasMore(newCursor !== null)
    } else {
      setHasMore(false)
    }
    setIsFetchingMore(false)
  }, [isFetchingMore, hasMore, cursor, loadFeed])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isFetchingMore, loadMore])

  const handlePostCreated = useCallback(() => {
    initialLoad()
  }, [initialLoad])

  // Split items: photo posts go to masonry, text posts and ads stay in a list
  const photoItems: PostItem[] = []
  const textAndAdItems: FeedItem[] = []

  for (const item of items) {
    if (item.type === 'post' && item.media.length > 0) {
      photoItems.push(item)
    } else {
      textAndAdItems.push(item)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.heading}>Flode</h1>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.shareBtn}
              onClick={() => setComposerOpen(true)}
            >
              Share a moment
            </button>
          </div>
        </div>
        <nav className={styles.tabs} aria-label="Flodesfilter">
          {FEED_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={[styles.tab, activeTab === tab ? styles.tabActive : ''].join(' ')}
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main
        className={styles.feed}
        role="feed"
        aria-label="Socialt flode"
        aria-busy={isLoading}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <m.div
              key="skeleton"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              <FeedSkeleton />
            </m.div>
          ) : items.length === 0 ? (
            <m.div
              key="empty"
              variants={slideUp}
              initial="initial"
              animate="animate"
              transition={springs.soft}
            >
              <EmptyState
                title="Inga inlagg annu"
                description="Var den forsta att dela nagot med gemenskapen."
                action={{ label: 'Skapa inlagg', onClick: () => setComposerOpen(true) }}
              />
            </m.div>
          ) : (
            <m.div
              key="feed"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Photo posts in Polaroid masonry grid */}
              {photoItems.length > 0 && (
                <PolaroidMasonryGrid columns={3} gap="2rem" className={styles.masonry}>
                  {photoItems.map((item) => (
                    <PostCard
                      key={item.id}
                      id={item.id}
                      author={item.author}
                      content={item.content}
                      media={item.media}
                      likeCount={item.likeCount}
                      commentCount={item.commentCount}
                      isLiked={item.isLiked}
                      createdAt={item.createdAt}
                    />
                  ))}
                </PolaroidMasonryGrid>
              )}

              {/* Text-only posts and ads below the masonry grid */}
              {textAndAdItems.length > 0 && (
                <div className={styles.list}>
                  {textAndAdItems.map((item, index) => {
                    if (item.type === 'ad') {
                      return (
                        <FeedAdCard
                          key={`ad-${item.campaignId}-${item.creativeId}-${index}`}
                          campaignId={item.campaignId}
                          creativeId={item.creativeId}
                          sponsor={item.sponsor}
                          headline={item.headline}
                          body={item.body}
                          imageUrl={item.imageUrl}
                          ctaUrl={item.ctaUrl}
                        />
                      )
                    }
                    return (
                      <PostCard
                        key={item.id}
                        id={item.id}
                        author={item.author}
                        content={item.content}
                        media={item.media}
                        likeCount={item.likeCount}
                        commentCount={item.commentCount}
                        isLiked={item.isLiked}
                        createdAt={item.createdAt}
                      />
                    )
                  })}
                </div>
              )}
            </m.div>
          )}
        </AnimatePresence>

        {isFetchingMore && (
          <m.div
            className={styles.loadingMore}
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <div className={styles.loadingDots} aria-label="Laddar fler inlagg">
              <span />
              <span />
              <span />
            </div>
          </m.div>
        )}

        {!hasMore && items.length > 0 && (
          <m.p
            className={styles.endLabel}
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            Du har sett allt for nu
          </m.p>
        )}

        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      </main>

      <button
        type="button"
        className={styles.fab}
        onClick={() => setComposerOpen(true)}
        aria-label="Skapa nytt inlagg"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}
