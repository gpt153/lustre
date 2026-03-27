'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { trpc } from '@lustre/api'
import { CommentSection } from './CommentSection'
import styles from './PostCard.module.css'

export type FeedPost = {
  type: 'post'
  id: string
  text: string | null
  createdAt: Date
  author: { id: string; displayName: string | null; avatarUrl: string | null }
  media: Array<{ id: string; url: string; thumbnailMedium: string | null }>
  likeCount: number
  isLiked: boolean
  commentCount?: number
}

export type FeedAd = {
  type: 'ad'
  campaignId: string
  creativeId: string
  headline: string
  body: string | null
  imageUrl: string | null
  ctaUrl: string
  sponsor: string | null
}

interface PostCardProps {
  post: FeedPost
  onLikeToggle?: (postId: string, isLiked: boolean) => void
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'nu'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return new Date(date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  if (typeof window === 'undefined') return null
  return createPortal(
    <div
      className={styles.lightboxOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bildvisning"
    >
      <button className={styles.lightboxClose} onClick={onClose} aria-label="Stäng">
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className={styles.lightboxImage}
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  )
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [heartAnimating, setHeartAnimating] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const likeMutation = trpc.post.like.useMutation()
  const unlikeMutation = trpc.post.unlike.useMutation()

  const handleLikeToggle = useCallback(async () => {
    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikeCount((c) => c + (nextLiked ? 1 : -1))

    if (nextLiked) {
      setHeartAnimating(true)
      setTimeout(() => setHeartAnimating(false), 320)
      try {
        await likeMutation.mutateAsync({ postId: post.id })
      } catch {
        setIsLiked(false)
        setLikeCount((c) => c - 1)
      }
    } else {
      try {
        await unlikeMutation.mutateAsync({ postId: post.id })
      } catch {
        setIsLiked(true)
        setLikeCount((c) => c + 1)
      }
    }

    onLikeToggle?.(post.id, nextLiked)
  }, [isLiked, post.id, likeMutation, unlikeMutation, onLikeToggle])

  const gridClass =
    post.media.length === 1
      ? styles.mediaGridSingle
      : post.media.length === 2
        ? styles.mediaGridDouble
        : post.media.length === 3
          ? styles.mediaGridTriple
          : styles.mediaGridMany

  return (
    <article className={styles.postCard}>
      {/* Author Header */}
      <div className={styles.authorHeader}>
        {post.author.avatarUrl ? (
          <Image
            src={post.author.avatarUrl}
            alt={post.author.displayName ?? 'Användare'}
            width={40}
            height={40}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            {(post.author.displayName ?? '?')[0].toUpperCase()}
          </div>
        )}
        <div className={styles.authorInfo}>
          <Link href={`/profile/${post.author.id}`} className={styles.authorName}>
            {post.author.displayName ?? 'Anonym'}
          </Link>
          <time className={styles.timestamp} dateTime={new Date(post.createdAt).toISOString()}>
            {getTimeAgo(post.createdAt)}
          </time>
        </div>
      </div>

      {/* Post Text */}
      {post.text && <p className={styles.contentText}>{post.text}</p>}

      {/* Media Grid */}
      {post.media.length > 0 && (
        <div className={`${styles.mediaGrid} ${gridClass}`}>
          {post.media.map((item) => (
            <div
              key={item.id}
              className={styles.postImageWrap}
              onClick={() => setLightboxSrc(item.url)}
              role="button"
              tabIndex={0}
              aria-label="Visa bild i helskärm"
              onKeyDown={(e) => e.key === 'Enter' && setLightboxSrc(item.url)}
            >
              <Image
                src={item.thumbnailMedium ?? item.url}
                alt="Inläggsbilder"
                fill
                sizes="(max-width: 720px) 100vw, 720px"
                className={styles.postImage}
                loading="lazy"
                style={post.media.length === 1 ? { position: 'relative' } : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <button
          className={`${styles.actionButton} ${isLiked ? styles.actionButtonLiked : ''}`}
          onClick={handleLikeToggle}
          aria-label={isLiked ? 'Ta bort gillning' : 'Gilla inlägg'}
          aria-pressed={isLiked}
        >
          <span
            className={`${styles.heartIcon} ${heartAnimating ? styles.heartAnimating : ''}`}
            aria-hidden="true"
          >
            {isLiked ? '♥' : '♡'}
          </span>
          {likeCount > 0 && <span className={styles.actionCount}>{likeCount}</span>}
        </button>

        <button
          className={styles.actionButton}
          onClick={() => setShowComments((v) => !v)}
          aria-label="Visa kommentarer"
          aria-expanded={showComments}
        >
          <span aria-hidden="true">💬</span>
          {(post.commentCount ?? 0) > 0 && (
            <span className={styles.actionCount}>{post.commentCount}</span>
          )}
        </button>

        <button
          className={styles.actionButton}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ url: `${window.location.origin}/post/${post.id}` })
            } else {
              navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
            }
          }}
          aria-label="Dela inlägg"
        >
          <span aria-hidden="true">↗</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && <CommentSection postId={post.id} />}

      {/* Lightbox */}
      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt="Bildvisning"
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </article>
  )
}

interface AdCardProps {
  ad: FeedAd
  onImpression: () => void
  onClick: () => void
}

export function AdCard({ ad, onImpression, onClick }: AdCardProps) {
  const [impressed, setImpressed] = useState(false)

  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || impressed) return
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setImpressed(true)
            onImpression()
            observer.disconnect()
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(node)
    },
    [impressed, onImpression]
  )

  return (
    <article className={styles.sponsoredCard} ref={handleRef}>
      <p className={styles.sponsoredLabel}>Sponsrad{ad.sponsor ? ` · ${ad.sponsor}` : ''}</p>

      {ad.imageUrl && (
        <div className={styles.adImageWrap}>
          <Image
            src={ad.imageUrl}
            alt={ad.headline}
            fill
            sizes="720px"
            className={styles.adImage}
            loading="lazy"
          />
        </div>
      )}

      <p className={styles.adHeadline}>{ad.headline}</p>
      {ad.body && <p className={styles.adBody}>{ad.body}</p>}

      <a
        href={ad.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.adCta}
        onClick={onClick}
      >
        Läs mer
      </a>
    </article>
  )
}
