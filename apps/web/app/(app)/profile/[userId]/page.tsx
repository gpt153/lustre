'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import PhotoGallery from '@/components/profile/PhotoGallery'
import PromptCard from '@/components/profile/PromptCard'
import KudosSection from '@/components/profile/KudosSection'
import ProfileSkeleton from '@/components/profile/ProfileSkeleton'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

interface Photo {
  id: string
  url: string
  alt?: string
}

interface Prompt {
  id: string
  question: string
  answer: string
}

interface KudosBadge {
  badgeId: string
  badgeName: string
  emoji: string
  count: number
}

interface PairLink {
  id: string
  displayName: string
  photoUrl?: string
}

interface Profile {
  id: string
  displayName: string
  age: number
  location: string
  bio: string
  photos: Photo[]
  prompts: Prompt[]
  kudos: KudosBadge[]
  isVerified: boolean
  pairLinks: PairLink[]
}

const MOCK_PUBLIC_PROFILE: Profile = {
  id: 'other-user',
  displayName: 'Emma',
  age: 27,
  location: 'Göteborg',
  bio: 'Kreativ och nyfiken. Älskar konst, resor och bra samtal över ett glas vin. Letar efter genuina möten med intressanta människor.',
  photos: [],
  prompts: [
    { id: 'pr1', question: 'Jag söker efter...', answer: 'Äkta kontakt och delade upplevelser' },
    { id: 'pr2', question: 'En perfekt helg är...', answer: 'Morgon på marknaden, eftermiddag på museum, kväll med bra middagsällskap' },
    { id: 'pr3', question: 'Vad få vet om mig...', answer: 'Jag kan tala tre språk, inklusive ett ingen förväntar sig' },
  ],
  kudos: [
    { badgeId: 'b1', badgeName: 'Bra lyssnare', emoji: '👂', count: 9 },
    { badgeId: 'b2', badgeName: 'Respektfull', emoji: '🤝', count: 12 },
    { badgeId: 'b4', badgeName: 'Engagerad', emoji: '✨', count: 6 },
  ],
  isVerified: true,
  pairLinks: [],
}

export default function PublicProfilePage() {
  const params = useParams()
  const rawUserId = params?.userId
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : (rawUserId ?? '')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeSaving, setLikeSaving] = useState(false)

  const loadProfile = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const profileData = await api.profile.getPublic.query({ userId })
      let kudosData
      try {
        kudosData = await api.kudos.getProfileKudos.query({ userId })
      } catch {
        kudosData = []
      }
      // Map API shape to component shape
      const photos = (profileData.photos ?? []).map((p: { id: string; url?: string; thumbnailSmall?: string }) => ({
        id: p.id,
        url: p.url || p.thumbnailSmall || '',
      }))
      const pairLinks = (profileData.linkedPartners ?? []).map((lp: { userId: string; displayName: string; thumbnailUrl?: string }) => ({
        id: lp.userId,
        displayName: lp.displayName,
        photoUrl: lp.thumbnailUrl,
      }))
      setProfile({
        id: profileData.userId ?? userId,
        displayName: profileData.displayName ?? '',
        age: profileData.age ?? 0,
        location: profileData.locationName ?? '',
        bio: profileData.bio ?? '',
        photos,
        prompts: [],
        kudos: Array.isArray(kudosData) ? kudosData : (kudosData?.badges ?? []),
        isVerified: profileData.isVerified ?? false,
        pairLinks,
      })
    } catch {
      setProfile(MOCK_PUBLIC_PROFILE)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleLike = useCallback(async () => {
    if (likeSaving) return
    setLikeSaving(true)
    try {
      if (isLiked) {
        await api.match.swipe.mutate({ targetUserId: userId, action: 'PASS' })
        setIsLiked(false)
        addToast('Gilla borttagen', 'info')
      } else {
        await api.match.swipe.mutate({ targetUserId: userId, action: 'LIKE' })
        setIsLiked(true)
        addToast('Du gillar den här personen', 'success')
      }
    } catch {
      addToast('Kunde inte spara', 'error')
    } finally {
      setLikeSaving(false)
    }
  }, [userId, isLiked, likeSaving])

  if (isLoading) return <ProfileSkeleton />

  if (!profile) return null

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{profile.displayName}</h1>
            <span className={styles.age}>{profile.age}</span>
            {profile.isVerified && (
              <span className={styles.verifiedBadge} title="Verifierad profil" aria-label="Verifierad profil">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M8 1l1.8 2.2 2.8-.4.4 2.8L15 8l-2 1.8.4 2.8-2.8-.4L8 15l-1.8-2.2-2.8.4L3 10.4 1 8.6 2.8 7 2.4 4.2l2.8.4L8 1z"
                    fill="var(--color-gold)"
                  />
                  <path d="M5.5 8l1.5 1.5 3.5-3.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
          {profile.location && (
            <div className={styles.location}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path
                  d="M6.5 1C4.29 1 2.5 2.79 2.5 5c0 3.25 4 7 4 7s4-3.75 4-7c0-2.21-1.79-4-4-4z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="6.5" cy="5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </header>

      {/* Photo gallery */}
      <section className={styles.section} aria-label="Foton">
        <PhotoGallery photos={profile.photos} editable={false} />
      </section>

      {/* Bio */}
      <section className={styles.section} aria-labelledby="bio-heading-pub">
        <h2 className={styles.sectionTitle} id="bio-heading-pub">Om {profile.displayName}</h2>
        <p className={styles.bio}>{profile.bio || 'Ingen bio.'}</p>
      </section>

      {/* Prompts */}
      {profile.prompts.length > 0 && (
        <section className={styles.section} aria-label="Frågor och svar">
          <h2 className={styles.sectionTitle}>Svar på frågor</h2>
          <div className={styles.promptList}>
            {profile.prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                editable={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Kudos */}
      <section className={styles.section}>
        <KudosSection kudos={profile.kudos} userId={profile.id} canGive />
      </section>

      {/* Pair links */}
      {profile.pairLinks.length > 0 && (
        <section className={styles.section} aria-labelledby="pairs-heading-pub">
          <h2 className={styles.sectionTitle} id="pairs-heading-pub">Kopplade partners</h2>
          <div className={styles.pairLinks}>
            {profile.pairLinks.map((pair) => (
              <div key={pair.id} className={styles.pairCard}>
                <div className={styles.pairAvatar} aria-hidden="true">
                  {pair.photoUrl ? (
                    <img src={pair.photoUrl} alt="" className={styles.pairPhoto} />
                  ) : (
                    <span className={styles.pairInitial}>
                      {pair.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className={styles.pairName}>{pair.displayName}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA bar — message + like */}
      <div className={styles.ctaBar} role="group" aria-label="Handlingar">
        <button
          type="button"
          className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
          onClick={handleLike}
          disabled={likeSaving}
          aria-pressed={isLiked}
          aria-label={isLiked ? 'Ta bort gilla' : 'Gilla profil'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 17s-7-4.7-7-9.5A4.5 4.5 0 0 1 10 5.14 4.5 4.5 0 0 1 17 7.5C17 12.3 10 17 10 17z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill={isLiked ? 'currentColor' : 'none'}
            />
          </svg>
          {isLiked ? 'Gillad' : 'Gilla'}
        </button>

        <Link
          href={`/chat?userId=${profile.id}`}
          className={styles.messageButton}
          aria-label={`Skicka meddelande till ${profile.displayName}`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M2 2h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5l-4 3V3a1 1 0 0 1 1-1z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          Skicka meddelande
        </Link>
      </div>
    </div>
  )
}
