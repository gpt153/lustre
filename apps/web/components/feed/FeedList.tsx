'use client'

import { useEffect, useRef, useCallback } from 'react'
import { trpc } from '@lustre/api'
import { PostCard, AdCard, FeedPost, FeedAd } from './PostCard'
import { PostComposer } from './PostComposer'
import styles from './FeedList.module.css'

type FeedItem = FeedPost | FeedAd

const FEED_PAGE_SIZE = 15

function SkeletonPostCard() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonAvatar} />
        <div className={styles.skeletonLines}>
          <div className={styles.skeletonLine} style={{ width: '45%' }} />
          <div className={styles.skeletonLine} style={{ width: '28%' }} />
        </div>
      </div>
      <div className={styles.skeletonContent} />
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonActions}>
        <div className={styles.skeletonAction} />
        <div className={styles.skeletonAction} />
        <div className={styles.skeletonAction} />
      </div>
    </div>
  )
}

export function FeedList() {
  const feedQuery = trpc.post.feed.useInfiniteQuery(
    { limit: FEED_PAGE_SIZE },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const recordImpression = trpc.ad.recordImpression.useMutation()
  const recordClick = trpc.ad.recordClick.useMutation()

  const items = (feedQuery.data?.pages.flatMap((page) => page.posts) ?? []) as unknown as FeedItem[]

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(() => {
    if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
      feedQuery.fetchNextPage()
    }
  }, [feedQuery])

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleLoadMore])

  const handleAdImpression = useCallback(
    (campaignId: string, creativeId: string) => {
      recordImpression.mutate({ campaignId, creativeId })
    },
    [recordImpression]
  )

  const handleAdClick = useCallback(
    (campaignId: string, creativeId: string) => {
      recordClick.mutate({ campaignId, creativeId })
    },
    [recordClick]
  )

  return (
    <div className={styles.feed}>
      {/* Post Composer */}
      <PostComposer onSuccess={() => feedQuery.refetch()} />

      {/* Initial loading skeletons */}
      {feedQuery.isLoading && (
        <>
          <SkeletonPostCard />
          <SkeletonPostCard />
          <SkeletonPostCard />
        </>
      )}

      {/* Empty state */}
      {!feedQuery.isLoading && items.length === 0 && (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Inga inlägg än</h2>
          <p className={styles.emptyText}>Var den första att dela något!</p>
        </div>
      )}

      {/* Feed items */}
      {items.map((item) => {
        if (item.type === 'ad') {
          return (
            <AdCard
              key={`ad-${item.campaignId}-${item.creativeId}`}
              ad={item}
              onImpression={() => handleAdImpression(item.campaignId, item.creativeId)}
              onClick={() => handleAdClick(item.campaignId, item.creativeId)}
            />
          )
        }
        return <PostCard key={item.id} post={item} />
      })}

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className={styles.loadMoreSentinel} aria-hidden="true" />

      {/* Loading more skeletons */}
      {feedQuery.isFetchingNextPage && (
        <>
          <SkeletonPostCard />
          <SkeletonPostCard />
        </>
      )}

      {/* End of feed indicator */}
      {!feedQuery.hasNextPage && items.length > 0 && (
        <div className={styles.loadingMore}>
          <div className={styles.loadingDots}>
            <div className={styles.loadingDot} />
            <div className={styles.loadingDot} />
            <div className={styles.loadingDot} />
          </div>
        </div>
      )}
    </div>
  )
}
