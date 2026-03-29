'use client'

import { useState, useCallback, MouseEvent } from 'react'
import { m } from 'motion/react'
import { springs, slideUp } from '@/lib/motion'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import PolaroidCard from '@/components/common/PolaroidCard'
import LikeBurst from './LikeBurst'
import styles from './PostCard.module.css'

interface MediaItem {
  url: string
  alt?: string
}

interface PostAuthor {
  id: string
  displayName: string
  photoUrl?: string
}

interface PostCardProps {
  id: string
  author: PostAuthor
  content: string
  media: MediaItem[]
  likeCount: number
  commentCount: number
  isLiked: boolean
  createdAt: string
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just nu'
  if (diffMins < 60) return `${diffMins} min`
  if (diffHours < 24) return `${diffHours} tim`
  if (diffDays === 1) return 'igår'
  if (diffDays < 7) return `${diffDays} d`
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

interface BurstState {
  x: number
  y: number
  id: number
}

export default function PostCard({
  id,
  author,
  content,
  media,
  likeCount: initialLikeCount,
  commentCount,
  isLiked: initialIsLiked,
  createdAt,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isExpanded, setIsExpanded] = useState(false)
  const [burst, setBurst] = useState<BurstState | null>(null)

  const shouldTruncate = content.length > 280 && !isExpanded

  const handleLike = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2

      if (!isLiked) {
        setBurst({ x, y, id: Date.now() })
      }

      const nextLiked = !isLiked
      setIsLiked(nextLiked)
      setLikeCount((c) => c + (nextLiked ? 1 : -1))

      try {
        if (nextLiked) {
          await api.post.like.mutate({ postId: id })
        } else {
          await api.post.unlike.mutate({ postId: id })
        }
      } catch {
        // Revert on error
        setIsLiked(!nextLiked)
        setLikeCount((c) => c + (nextLiked ? -1 : 1))
        addToast('Kunde inte uppdatera gilla. Försök igen.', 'error')
      }
    },
    [id, isLiked]
  )

  const handleBurstComplete = useCallback(() => {
    setBurst(null)
  }, [])

  const initials = author.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <m.article
        className={styles.card}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={springs.soft}
        role="article"
        aria-label={`Inlägg av ${author.displayName}`}
      >
        <div className={styles.header}>
          <div className={styles.avatar} aria-hidden="true">
            {author.photoUrl ? (
              <img
                src={author.photoUrl}
                alt={`${author.displayName}s profilbild`}
                className={styles.avatarImage}
              />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.displayName}>{author.displayName}</span>
            <time
              className={styles.timestamp}
              dateTime={createdAt}
              title={new Date(createdAt).toLocaleString('sv-SE')}
            >
              {formatRelativeTime(createdAt)}
            </time>
          </div>
        </div>

        <div className={styles.body}>
          <p
            className={`${styles.content} ${shouldTruncate ? styles.contentClamped : ''}`}
          >
            {content}
          </p>
          {content.length > 280 && !isExpanded && (
            <button
              type="button"
              className={styles.expandBtn}
              onClick={() => setIsExpanded(true)}
              aria-label="Visa hela inlägget"
            >
              Visa mer
            </button>
          )}
        </div>

        {media.length > 0 && (
          <div className={styles.media}>
            {media.length === 1 ? (
              <PolaroidCard
                imageUrl={media[0].url}
                imageAlt={media[0].alt ?? 'Foto'}
                rotation={1.5}
                hoverable={false}
                className={styles.mediaPolaroid}
              />
            ) : (
              <div className={styles.mediaRow}>
                {media.map((item, i) => (
                  <PolaroidCard
                    key={i}
                    imageUrl={item.url}
                    imageAlt={item.alt ?? `Foto ${i + 1}`}
                    rotation={i % 2 === 0 ? -2 : 2}
                    hoverable={false}
                    className={styles.mediaPolaroidSmall}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <m.button
            type="button"
            className={`${styles.actionBtn} ${isLiked ? styles.actionBtnLiked : ''}`}
            onClick={handleLike}
            aria-pressed={isLiked}
            aria-label="Gilla inlägg"
            whileTap={{ scale: 0.88 }}
            transition={springs.bouncy}
          >
            <m.svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              animate={isLiked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={isLiked ? springs.bouncy : { duration: 0 }}
            >
              <path
                d="M9 15.5C9 15.5 2 11.5 2 6.5C2 4.5 3.7 3 5.7 3C7.1 3 8.3 3.8 9 5C9.7 3.8 10.9 3 12.3 3C14.3 3 16 4.5 16 6.5C16 11.5 9 15.5 9 15.5Z"
                fill={isLiked ? 'var(--color-copper)' : 'none'}
                stroke={isLiked ? 'var(--color-copper)' : 'currentColor'}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </m.svg>
            <span className={styles.actionCount}>{likeCount}</span>
          </m.button>

          <button
            type="button"
            className={styles.actionBtn}
            aria-label={`${commentCount} kommentarer`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M3 3h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6l-3 3V4a1 1 0 0 1 1-1z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.actionCount}>{commentCount}</span>
          </button>
        </div>
      </m.article>

      {burst && (
        <LikeBurst
          key={burst.id}
          x={burst.x}
          y={burst.y}
          onComplete={handleBurstComplete}
        />
      )}
    </>
  )
}
