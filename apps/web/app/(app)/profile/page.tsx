'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import PhotoGallery from '@/components/profile/PhotoGallery'
import PromptCard from '@/components/profile/PromptCard'
import KudosSection from '@/components/profile/KudosSection'
import ProfileEdit from '@/components/profile/ProfileEdit'
import ProfileSkeleton from '@/components/profile/ProfileSkeleton'
import Button from '@/components/common/Button'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import { useAuthStore } from '@/lib/stores'

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

const MOCK_PROFILE: Profile = {
  id: 'current-user',
  displayName: 'Samuel',
  age: 29,
  location: 'Stockholm',
  bio: 'Teknikentusiast med passion för design och innovation. Älskar att utforska nya platser och möta intressanta människor.',
  photos: [],
  prompts: [
    { id: 'pr1', question: 'Jag söker efter...', answer: 'Genuina kopplingar och delade äventyr' },
    { id: 'pr2', question: 'Min bästa egenskap är...', answer: 'Min nyfikenhet och vilja att lära mig nytt' },
    { id: 'pr3', question: 'En perfekt första dejt...', answer: 'Promenad längs vattnet, bra samtal, spontant café-besök' },
  ],
  kudos: [
    { badgeId: 'b1', badgeName: 'Bra lyssnare', emoji: '👂', count: 5 },
    { badgeId: 'b2', badgeName: 'Respektfull', emoji: '🤝', count: 3 },
    { badgeId: 'b3', badgeName: 'Rolig', emoji: '😄', count: 8 },
  ],
  isVerified: true,
  pairLinks: [],
}

export default function OwnProfilePage() {
  const { userId } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const [profileData, photosData, kudosData] = await Promise.all([
        api.profile.get.query(),
        api.photo.list.query({ userId }),
        api.kudos.getProfileKudos.query({ userId }),
      ])
      setProfile({
        ...profileData,
        photos: photosData ?? [],
        kudos: kudosData ?? [],
      })
    } catch {
      setProfile(MOCK_PROFILE)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handlePromptSave = useCallback(
    async (promptId: string, answer: string) => {
      if (!profile) return
      try {
        await api.profile.update.mutate({ prompts: [{ id: promptId, answer }] })
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                prompts: prev.prompts.map((p) => (p.id === promptId ? { ...p, answer } : p)),
              }
            : prev
        )
        addToast('Svar sparat', 'success')
      } catch {
        addToast('Kunde inte spara svaret', 'error')
        throw new Error('save failed')
      }
    },
    [profile]
  )

  const handlePhotoUpload = useCallback(
    async (files: FileList) => {
      const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (validFiles.length === 0) return
      addToast('Laddar upp foton…', 'info')
      for (const file of validFiles) {
        const form = new FormData()
        form.append('photo', file)
        try {
          await fetch('/api/photos/upload', { method: 'POST', body: form })
        } catch {
          addToast('Kunde inte ladda upp foto', 'error')
        }
      }
      await loadProfile()
      addToast('Foton uppdaterade', 'success')
    },
    [loadProfile]
  )

  const handleEditSaved = useCallback(() => {
    setEditOpen(false)
    loadProfile()
  }, [loadProfile])

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
        <PhotoGallery
          photos={profile.photos}
          editable
          onUpload={handlePhotoUpload}
        />
      </section>

      {/* Bio */}
      <section className={styles.section} aria-labelledby="bio-heading">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="bio-heading">Om mig</h2>
        </div>
        <p className={styles.bio}>{profile.bio || 'Ingen bio ännu.'}</p>
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
                editable
                onSave={handlePromptSave}
              />
            ))}
          </div>
        </section>
      )}

      {/* Kudos */}
      <section className={styles.section}>
        <KudosSection kudos={profile.kudos} userId={profile.id} canGive={false} />
      </section>

      {/* Pair links */}
      {profile.pairLinks.length > 0 && (
        <section className={styles.section} aria-labelledby="pairs-heading">
          <h2 className={styles.sectionTitle} id="pairs-heading">Kopplade partners</h2>
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

      {/* Inline edit panel */}
      {editOpen && (
        <section className={styles.section} aria-label="Redigera profil">
          <ProfileEdit
            bio={profile.bio}
            displayName={profile.displayName}
            prompts={profile.prompts}
            onSaved={handleEditSaved}
            onCancel={() => setEditOpen(false)}
          />
        </section>
      )}

      {/* Floating edit button */}
      {!editOpen && (
        <div className={styles.fab}>
          <Button
            variant="primary"
            size="md"
            onClick={() => setEditOpen(true)}
            aria-label="Redigera profil"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M10.5 1.5a1.5 1.5 0 0 1 2.12 2.12L5.5 10.75l-3.25.75.75-3.25 7.5-6.75z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Redigera profil
          </Button>
        </div>
      )}
    </div>
  )
}
