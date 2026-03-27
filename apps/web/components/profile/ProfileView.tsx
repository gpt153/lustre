'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/common/Button'
import { PromptCard } from '@/components/profile/PromptCard'
import styles from './ProfileView.module.css'

export interface ProfileViewPhoto {
  id: string
  url: string
  thumbnailSmall?: string | null
  position: number
}

export interface ProfileViewPrompt {
  id: string
  promptKey: string
  response: string
  order: number
}

export interface ProfileViewKudosBadge {
  badgeId: string
  name: string
  count: number
}

export interface ProfileViewData {
  id: string
  displayName: string
  age?: number | null
  bio?: string | null
  photos: ProfileViewPhoto[]
  prompts?: ProfileViewPrompt[]
}

export interface ProfileViewKudos {
  totalCount: number
  badges: ProfileViewKudosBadge[]
}

interface ProfileViewProps {
  profile: ProfileViewData
  kudos?: ProfileViewKudos
  isOwnProfile?: boolean
  isPanel?: boolean
  onLike?: () => void
  onPass?: () => void
  onSuperLike?: () => void
  onEdit?: () => void
}

const PROMPT_LABELS: Record<string, string> = {
  seeking: 'Jag söker…',
  perfect_date: 'Min perfekta dejt…',
  unknown_fact: 'Vad folk inte vet om mig…',
  best_advice: 'Mitt bästa råd…',
  guarantee: 'Jag garanterar att…',
}

function getPromptQuestion(promptKey: string): string {
  return PROMPT_LABELS[promptKey] ?? promptKey
}

export function ProfileView({
  profile,
  kudos,
  isOwnProfile = false,
  isPanel = false,
  onLike,
  onPass,
  onSuperLike,
  onEdit,
}: ProfileViewProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [showStickyHeader, setShowStickyHeader] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyHeader(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isOwnProfile) return
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'l' || e.key === 'L') onLike?.()
      if (e.key === 'p' || e.key === 'P') onPass?.()
      if (e.key === 's' || e.key === 'S') onSuperLike?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOwnProfile, onLike, onPass, onSuperLike])

  const sortedPhotos = [...profile.photos].sort((a, b) => a.position - b.position)
  const heroPhoto = sortedPhotos[0]
  const galleryPhotos = sortedPhotos.slice(1)
  const sortedPrompts = [...(profile.prompts ?? [])].sort((a, b) => a.order - b.order)

  const wrapperClass = isPanel ? styles.profileViewPanel : styles.profileView

  const ActionBarButtons = useCallback(
    () => (
      <>
        <button
          className={[styles.actionButton, styles.passButton].join(' ')}
          onClick={onPass}
          aria-label="Pass (P)"
          title="Pass (P)"
          type="button"
        >
          <span className={styles.actionButtonIcon}>✕</span>
        </button>
        <button
          className={[styles.actionButton, styles.likeButton].join(' ')}
          onClick={onLike}
          aria-label="Like (L)"
          title="Like (L)"
          type="button"
        >
          <span className={styles.actionButtonIcon}>♥</span>
        </button>
        <button
          className={[styles.actionButton, styles.superButton].join(' ')}
          onClick={onSuperLike}
          aria-label="Super Like (S)"
          title="Super Like (S)"
          type="button"
        >
          <span className={styles.actionButtonIcon}>★</span>
        </button>
      </>
    ),
    [onLike, onPass, onSuperLike]
  )

  return (
    <>
      {/* Sticky header */}
      <div
        className={[
          styles.stickyHeader,
          showStickyHeader ? styles.stickyHeaderVisible : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={!showStickyHeader}
      >
        <div className={styles.stickyHeaderContent}>
          <span className={styles.nameAge}>
            {profile.displayName}
            {profile.age ? `, ${profile.age}` : ''}
          </span>
        </div>
      </div>

      <div className={wrapperClass}>
        {/* Hero photo */}
        {heroPhoto && (
          <div className={styles.heroPhoto} ref={heroRef}>
            <Image
              src={heroPhoto.url}
              alt={`${profile.displayName}s huvudfoto`}
              fill
              sizes="(max-width: 600px) 100vw, 600px"
              className={styles.heroPhotoImage}
              priority
            />
          </div>
        )}

        {/* Profile info */}
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>
            {profile.displayName}
            {profile.age ? `, ${profile.age}` : ''}
          </h1>
          <div className={styles.profileMeta}>
            <span className={styles.appBadge} title="Öppna i appen för fler funktioner">
              Öppna i appen
            </span>
          </div>
        </div>

        {/* Action bar (full view) */}
        {!isOwnProfile && !isPanel && (
          <div className={styles.actionBar}>
            <ActionBarButtons />
          </div>
        )}

        {/* Bio */}
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        {/* First prompt */}
        {sortedPrompts.slice(0, 1).map((prompt) => (
          <div key={prompt.id} className={styles.promptsSection}>
            <PromptCard
              question={getPromptQuestion(prompt.promptKey)}
              answer={prompt.response}
            />
          </div>
        ))}

        {/* Gallery photos */}
        {galleryPhotos.length > 0 && (
          <div className={styles.sectionGallery}>
            {galleryPhotos.map((photo, idx) => (
              <div key={photo.id} className={styles.galleryPhoto}>
                <Image
                  src={photo.url}
                  alt={`${profile.displayName}s foto ${idx + 2}`}
                  fill
                  sizes="(max-width: 600px) 100vw, 600px"
                  className={styles.galleryPhotoImage}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Remaining prompts */}
        {sortedPrompts.length > 1 && (
          <div className={styles.promptsSection}>
            {sortedPrompts.slice(1).map((prompt) => (
              <PromptCard
                key={prompt.id}
                question={getPromptQuestion(prompt.promptKey)}
                answer={prompt.response}
              />
            ))}
          </div>
        )}

        {/* Kudos */}
        {kudos && kudos.totalCount > 0 && (
          <div className={styles.kudosSection}>
            <h2 className={styles.kudosTitle}>
              Kudos{' '}
              <span className={styles.kudosCount}>{kudos.totalCount} totalt</span>
            </h2>
            <div className={styles.kudosBadges}>
              {kudos.badges.slice(0, 8).map((badge) => (
                <span key={badge.badgeId} className={styles.kudosBadge}>
                  {badge.name}
                  <span className={styles.kudosBadgeCount}>×{badge.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Edit button for own profile */}
        {isOwnProfile && onEdit && (
          <div className={styles.editButton}>
            <Button variant="secondary" onClick={onEdit}>
              Redigera profil
            </Button>
          </div>
        )}

        {/* Panel sticky action bar */}
        {isPanel && !isOwnProfile && (
          <div className={styles.panelActions}>
            <button
              className={[styles.actionButton, styles.passButton].join(' ')}
              onClick={onPass}
              aria-label="Pass"
              type="button"
            >
              <span className={styles.actionButtonIcon}>✕</span>
            </button>
            <button
              className={[styles.actionButton, styles.likeButton].join(' ')}
              onClick={onLike}
              aria-label="Like"
              type="button"
            >
              <span className={styles.actionButtonIcon}>♥</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
