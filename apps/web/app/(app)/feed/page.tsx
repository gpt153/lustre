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
    content: 'Underbar promenad längs Strandvägen idag. Hösten är verkligen Stockholms bästa årstid 🍂',
    media: [],
    likeCount: 12,
    commentCount: 3,
    isLiked: false,
    createdAt: '2026-03-27T08:30:00Z',
  },
  {
    type: 'post' as const,
    id: 'p2',
    author: { id: 'u2', displayName: 'Sofia', photoUrl: '' },
    content: 'Ny målning klar! Inspirerad av kvällsljuset över hamnen i Göteborg.',
    media: [],
    likeCount: 24,
    commentCount: 7,
    isLiked: true,
    createdAt: '2026-03-27T06:15:00Z',
  },
  {
    type: 'post' as const,
    id: 'p3',
    author: { id: 'u3', displayName: 'Lina', photoUrl: '' },
    content: 'Dagens yogapass var magiskt. Påminner mig om varför jag älskar mitt jobb ✨',
    media: [],
    likeCount: 18,
    commentCount: 2,
    isLiked: false,
    createdAt: '2026-03-26T20:00:00Z',
  },
  {
    type: 'post' as const,
    id: 'p4',
    author: { id: 'u4', displayName: 'Alex', photoUrl: '' },
    content: 'Testade ett nytt recept ikväll — thai curry med lokala grönsaker. Rekommenderas varmt!',
    media: [],
    likeCount: 31,
    commentCount: 9,
    isLiked: false,
    createdAt: '2026-03-26T18:45:00Z',
  },
  {
    type: 'ad' as const,
    campaignId: 'camp-1',
    creativeId: 'cre-1',
    sponsor: 'Lustre Events',
    headline: 'Mingel & Mys — Stockholms nya dejtingevent',
    body: 'Träffa likasinnade i en avslappnad miljö. Nästa event: 5 april.',
    imageUrl: '',
    ctaUrl: '/events',
  },
  {
    type: 'post' as const,
    id: 'p5',
    author: { id: 'u5', displayName: 'Maja', photoUrl: '' },
    content: 'Min katt har bestämt sig för att sova på tangentbordet. Produktiviteten är... begränsad 😅',
    media: [],
    likeCount: 45,
    commentCount: 14,
    isLiked: false,
    createdAt: '2026-03-26T16:00:00Z',
  },
]

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [composerOpen, setComposerOpen] = useState(false)
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Flöde</h1>
      </header>

      <main
        className={styles.feed}
        role="feed"
        aria-label="Socialt flöde"
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
                title="Inga inlägg ännu"
                description="Var den första att dela något med gemenskapen."
                action={{ label: 'Skapa inlägg', onClick: () => setComposerOpen(true) }}
              />
            </m.div>
          ) : (
            <m.div
              key="feed"
              className={styles.list}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {items.map((item, index) => {
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
            <div className={styles.loadingDots} aria-label="Laddar fler inlägg">
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
            Du har sett allt för nu ✦
          </m.p>
        )}

        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      </main>

      <button
        type="button"
        className={styles.fab}
        onClick={() => setComposerOpen(true)}
        aria-label="Skapa nytt inlägg"
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
