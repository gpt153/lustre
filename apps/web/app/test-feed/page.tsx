'use client'

import { useState, useCallback, MouseEvent } from 'react'
import PolaroidCard from '@/components/common/PolaroidCard'
import PolaroidMasonryGrid from '@/components/common/PolaroidMasonryGrid'
import styles from './page.module.css'

interface MockPost {
  id: string
  caption: string
  imageUrl: string
  imageAlt: string
  likeCount: number
  commentCount: number
  isLiked: boolean
  createdAt: string
}

const MOCK_POSTS: MockPost[] = [
  {
    id: '1',
    caption: 'Coffee and quiet thoughts.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
    imageAlt: 'Steaming cup of coffee on a wooden table with a vintage journal',
    likeCount: 12,
    commentCount: 4,
    isLiked: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
  },
  {
    id: '2',
    caption: 'Chasing the golden hour...',
    imageUrl: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=750&fit=crop',
    imageAlt: 'Golden hour sunlight filtering through tall golden grass',
    likeCount: 28,
    commentCount: 7,
    isLiked: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
  },
  {
    id: '3',
    caption: 'Getting my hands dirty today.',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
    imageAlt: 'Hands covered in clay working on a pottery wheel',
    likeCount: 45,
    commentCount: 12,
    isLiked: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
  },
  {
    id: '4',
    caption: 'The ocean breathes salty air.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop',
    imageAlt: 'Calm ocean at dawn with soft pastel pink and blue sky',
    likeCount: 34,
    commentCount: 3,
    isLiked: false,
    createdAt: new Date(Date.now() - 48 * 60 * 60_000).toISOString(),
  },
  {
    id: '5',
    caption: 'Rainy Sunday essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop',
    imageAlt: 'Stack of old hardcover books on a rug by a crackling fireplace',
    likeCount: 56,
    commentCount: 15,
    isLiked: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60_000).toISOString(),
  },
  {
    id: '6',
    caption: 'Lost in the peaks.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop',
    imageAlt: 'Misty mountain peaks at sunrise with deep green pine trees',
    likeCount: 21,
    commentCount: 2,
    isLiked: false,
    createdAt: new Date(Date.now() - 96 * 60 * 60_000).toISOString(),
  },
  {
    id: '7',
    caption: 'Summer nights in the garden.',
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=600&fit=crop',
    imageAlt: 'String lights in a garden during warm summer evening',
    likeCount: 67,
    commentCount: 19,
    isLiked: false,
    createdAt: new Date(Date.now() - 120 * 60 * 60_000).toISOString(),
  },
  {
    id: '8',
    caption: 'Slow mornings are the best.',
    imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=750&fit=crop',
    imageAlt: 'Breakfast spread on a sunlit table with fresh croissants',
    likeCount: 89,
    commentCount: 22,
    isLiked: true,
    createdAt: new Date(Date.now() - 144 * 60 * 60_000).toISOString(),
  },
  {
    id: '9',
    caption: 'Street art tells stories.',
    imageUrl: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600&h=600&fit=crop',
    imageAlt: 'Colorful street art mural on an urban brick wall',
    likeCount: 38,
    commentCount: 8,
    isLiked: false,
    createdAt: new Date(Date.now() - 168 * 60 * 60_000).toISOString(),
  },
  {
    id: '10',
    caption: 'Finding peace in the forest.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=800&fit=crop',
    imageAlt: 'Sunlight streaming through a dense green forest canopy',
    likeCount: 73,
    commentCount: 11,
    isLiked: true,
    createdAt: new Date(Date.now() - 192 * 60 * 60_000).toISOString(),
  },
]

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1d ago'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

function FeedPostCard({ post }: { post: MockPost }) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)

  const handleLike = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      const nextLiked = !isLiked
      setIsLiked(nextLiked)
      setLikeCount((c) => c + (nextLiked ? 1 : -1))
    },
    [isLiked]
  )

  return (
    <PolaroidCard
      imageUrl={post.imageUrl}
      imageAlt={post.imageAlt}
      caption={post.caption}
      hoverable
    >
      <div className={styles.polaroidActions}>
        <div className={styles.polaroidActionsLeft}>
          <button
            type="button"
            className={`${styles.polaroidActionBtn} ${isLiked ? styles.polaroidActionBtnLiked : ''}`}
            onClick={handleLike}
            aria-pressed={isLiked}
            aria-label="Like post"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M9 15.5C9 15.5 2 11.5 2 6.5C2 4.5 3.7 3 5.7 3C7.1 3 8.3 3.8 9 5C9.7 3.8 10.9 3 12.3 3C14.3 3 16 4.5 16 6.5C16 11.5 9 15.5 9 15.5Z"
                fill={isLiked ? 'var(--stitch-tertiary, #9f3c1e)' : 'none'}
                stroke={isLiked ? 'var(--stitch-tertiary, #9f3c1e)' : 'currentColor'}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.polaroidCount}>{likeCount}</span>
          </button>

          <button
            type="button"
            className={styles.polaroidActionBtn}
            aria-label={`${post.commentCount} comments`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M3 3h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6l-3 3V4a1 1 0 0 1 1-1z"
                stroke="var(--stitch-secondary, #795900)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.polaroidCount}>{post.commentCount}</span>
          </button>
        </div>

        <time
          className={styles.polaroidTimestamp}
          dateTime={post.createdAt}
        >
          {formatRelativeTime(post.createdAt)}
        </time>
      </div>
    </PolaroidCard>
  )
}

export default function TestFeedPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.heading}>Flode</h1>
          <div className={styles.headerActions}>
            <button type="button" className={styles.shareBtn}>
              Share a moment
            </button>
          </div>
        </div>
      </header>

      <main className={styles.feed}>
        <PolaroidMasonryGrid columns={3} gap="2rem">
          {MOCK_POSTS.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </PolaroidMasonryGrid>
      </main>
    </div>
  )
}
