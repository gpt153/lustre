'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import styles from './ProfileCard.module.css'

export interface DiscoverProfile {
  userId: string
  displayName: string
  age: number
  bio: string | null
  prompt: string | null
  verified: boolean
  photos: Array<{
    id: string
    url: string
    thumbnailLarge: string | null
  }>
}

interface ProfileCardProps {
  profile: DiscoverProfile
  index: number
  focused: boolean
  onLike: (userId: string) => void
  onPass: (userId: string) => void
  onSuperLike: (userId: string) => void
  onOpen: (userId: string) => void
  onFocus: (userId: string) => void
}

type FeedbackState = 'idle' | 'liked' | 'passed' | 'superliked'

export function ProfileCard({
  profile,
  index,
  focused,
  onLike,
  onPass,
  onSuperLike,
  onOpen,
  onFocus,
}: ProfileCardProps) {
  const [feedback, setFeedback] = useState<FeedbackState>('idle')

  const primaryPhoto = profile.photos[0]
  const secondaryPhoto = profile.photos[1]
  const isPriority = index < 8

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setFeedback('liked')
      setTimeout(() => onLike(profile.userId), 50)
    },
    [onLike, profile.userId]
  )

  const handlePass = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setFeedback('passed')
      setTimeout(() => onPass(profile.userId), 400)
    },
    [onPass, profile.userId]
  )

  const handleSuperLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setFeedback('superliked')
      setTimeout(() => onSuperLike(profile.userId), 50)
    },
    [onSuperLike, profile.userId]
  )

  const handleClick = useCallback(() => {
    onOpen(profile.userId)
  }, [onOpen, profile.userId])

  const handleFocus = useCallback(() => {
    onFocus(profile.userId)
  }, [onFocus, profile.userId])

  const cardClass = [
    styles.card,
    focused && styles.cardFocused,
    feedback === 'liked' && styles.cardLiked,
    feedback === 'passed' && styles.cardPassed,
    feedback === 'superliked' && styles.cardSuperLiked,
  ]
    .filter(Boolean)
    .join(' ')

  const promptText = profile.prompt || profile.bio

  return (
    <article
      className={cardClass}
      onClick={handleClick}
      onFocus={handleFocus}
      tabIndex={0}
      role="button"
      aria-label={`${profile.displayName}, ${profile.age}${profile.verified ? ', verified' : ''}`}
      data-userid={profile.userId}
    >
      {primaryPhoto ? (
        <>
          <Image
            className={styles.photoPrimary}
            src={primaryPhoto.thumbnailLarge || primaryPhoto.url}
            alt={`${profile.displayName}'s photo`}
            fill
            sizes="(max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={isPriority}
            loading={isPriority ? undefined : 'lazy'}
          />
          {secondaryPhoto && (
            <Image
              className={styles.photoSecondary}
              src={secondaryPhoto.thumbnailLarge || secondaryPhoto.url}
              alt=""
              fill
              sizes="(max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
              loading="lazy"
              aria-hidden="true"
            />
          )}
        </>
      ) : (
        <div className={styles.photoPlaceholder}>No photo</div>
      )}

      <div className={styles.actions} aria-label="Quick actions">
        <button
          className={`${styles.actionBtn} ${styles.actionBtnPass}`}
          onClick={handlePass}
          aria-label="Pass"
          title="Pass (P)"
          type="button"
        >
          ✕
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnSuperLike}`}
          onClick={handleSuperLike}
          aria-label="Super like"
          title="Super like (S)"
          type="button"
        >
          ★
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnLike}`}
          onClick={handleLike}
          aria-label="Like"
          title="Like (L)"
          type="button"
        >
          ♥
        </button>
      </div>

      <div className={styles.infoOverlay}>
        <div className={styles.nameAge}>
          {profile.displayName}, {profile.age}
          {profile.verified && ' ✓'}
        </div>
        {promptText && (
          <div className={styles.prompt}>{promptText}</div>
        )}
      </div>
    </article>
  )
}
