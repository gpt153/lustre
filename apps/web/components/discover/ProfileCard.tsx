'use client'

import { useCallback } from 'react'
import styles from './ProfileCard.module.css'

export interface DiscoverProfile {
  id: string
  displayName: string
  age: number
  photos: string[]
  location: string
  bio: string
}

interface ProfileCardProps {
  profile: DiscoverProfile
  onLike: (id: string) => void
  onPass: (id: string) => void
  isFocused?: boolean
  cardIndex: number
}

export default function ProfileCard({
  profile,
  onLike,
  onPass,
  isFocused = false,
  cardIndex,
}: ProfileCardProps) {
  const hasPhoto = profile.photos.length > 0
  const photoUrl = hasPhoto ? profile.photos[0] : null

  const handleLike = useCallback(() => {
    onLike(profile.id)
  }, [onLike, profile.id])

  const handlePass = useCallback(() => {
    onPass(profile.id)
  }, [onPass, profile.id])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault()
        onLike(profile.id)
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        onPass(profile.id)
      }
    },
    [onLike, onPass, profile.id]
  )

  return (
    <article
      className={[styles.card, isFocused ? styles.cardFocused : ''].join(' ')}
      data-card-index={cardIndex}
      tabIndex={0}
      aria-label={`${profile.displayName}, ${profile.age} år, ${profile.location}`}
      onKeyDown={handleKeyDown}
    >
      {/* Photo area */}
      <div className={styles.photoWrap}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${profile.displayName}s profilbild`}
            className={styles.photo}
            loading="lazy"
          />
        ) : (
          <div className={styles.photoPlaceholder} aria-hidden="true">
            <svg
              className={styles.placeholderIcon}
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="24" cy="19" r="8" fill="rgba(255,255,255,0.4)" />
              <path
                d="M6 40c0-9.9 8.1-18 18-18s18 8.1 18 18"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Name + age overlay */}
        <div className={styles.overlay}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{profile.displayName}</span>
            <span className={styles.age}>{profile.age}</span>
          </div>
        </div>

        {/* Action buttons — revealed on hover/focus */}
        <div className={styles.actions} aria-label="Kortåtgärder">
          <button
            className={[styles.actionBtn, styles.passBtn].join(' ')}
            onClick={handlePass}
            aria-label={`Passa på ${profile.displayName}`}
            tabIndex={-1}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button
            className={[styles.actionBtn, styles.likeBtn].join(' ')}
            onClick={handleLike}
            aria-label={`Gilla ${profile.displayName}`}
            tabIndex={-1}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path
                d="M11 19.5C11 19.5 2 13.5 2 7.5C2 5 4 3 6.5 3C8.1 3 9.5 3.9 10.3 5.2L11 6.4L11.7 5.2C12.5 3.9 13.9 3 15.5 3C18 3 20 5 20 7.5C20 13.5 11 19.5 11 19.5Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        <p className={styles.location}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M6 1C4.1 1 2.5 2.6 2.5 4.5C2.5 7.1 6 11 6 11C6 11 9.5 7.1 9.5 4.5C9.5 2.6 7.9 1 6 1ZM6 6C5.2 6 4.5 5.3 4.5 4.5C4.5 3.7 5.2 3 6 3C6.8 3 7.5 3.7 7.5 4.5C7.5 5.3 6.8 6 6 6Z"
              fill="currentColor"
            />
          </svg>
          {profile.location}
        </p>

        {profile.bio && (
          <p className={styles.bio}>{profile.bio}</p>
        )}
      </div>
    </article>
  )
}
