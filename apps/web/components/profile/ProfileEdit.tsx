'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { trpc } from '@lustre/api'
import { Input } from '@/components/common/Input'
import { useToast } from '@/components/common/Toast'
import { PhotoGrid, PhotoItem } from '@/components/profile/PhotoGrid'
import styles from './ProfileEdit.module.css'

export interface ProfileEditPhoto {
  id: string
  url: string
  position: number
}

export interface ProfileEditPrompt {
  id: string
  promptKey: string
  response: string
  order: number
}

export interface ProfileEditData {
  id: string
  displayName: string
  bio?: string | null
  photos: ProfileEditPhoto[]
}

interface ProfileEditProps {
  profile: ProfileEditData
  prompts?: ProfileEditPrompt[]
  onBack?: () => void
}

const PROMPT_LABELS: Record<string, string> = {
  seeking: 'Jag söker…',
  perfect_date: 'Min perfekta dejt…',
  unknown_fact: 'Vad folk inte vet om mig…',
  best_advice: 'Mitt bästa råd…',
  guarantee: 'Jag garanterar att…',
}

type SaveStatus = 'idle' | 'saving' | 'saved'

export function ProfileEdit({ profile, prompts = [], onBack }: ProfileEditProps) {
  const { toast } = useToast()
  const updateMutation = trpc.profile.update.useMutation()
  const setPromptsMutation = trpc.profile.setPrompts.useMutation()

  const [displayName, setDisplayName] = useState(profile.displayName)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [localPrompts, setLocalPrompts] = useState<ProfileEditPrompt[]>(
    [...prompts].sort((a, b) => a.order - b.order)
  )
  const [photos, setPhotos] = useState<PhotoItem[]>(
    [...profile.photos]
      .sort((a, b) => a.position - b.position)
      .map((p) => ({ id: p.id, url: p.url }))
  )
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const valuesRef = useRef({ displayName, bio, localPrompts })

  useEffect(() => {
    valuesRef.current = { displayName, bio, localPrompts }
  }, [displayName, bio, localPrompts])

  const triggerSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    debounceRef.current = setTimeout(async () => {
      const { displayName: name, bio: b, localPrompts: pr } = valuesRef.current
      try {
        await updateMutation.mutateAsync({
          displayName: name,
          bio: b || undefined,
        })
        if (pr.length > 0) {
          await setPromptsMutation.mutateAsync(
            pr.map((p) => ({
              promptKey: p.promptKey,
              response: p.response,
              order: p.order,
            }))
          )
        }
        setSaveStatus('saved')
        toast('Sparad', 'success')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
        toast('Kunde inte spara, försök igen', 'error')
      }
    }, 1000)
  }, [updateMutation, setPromptsMutation, toast])

  function handleDisplayNameChange(value: string) {
    setDisplayName(value)
    triggerSave()
  }

  function handleBioChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBio(e.target.value)
    triggerSave()
  }

  function handlePromptResponseChange(id: string, response: string) {
    setLocalPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, response } : p)))
    triggerSave()
  }

  return (
    <div className={styles.profileEdit}>
      <div className={styles.headerRow}>
        {onBack && (
          <button className={styles.backButton} onClick={onBack} type="button">
            ← Tillbaka
          </button>
        )}
        <h1 className={styles.headerTitle}>Redigera profil</h1>
        <div className={styles.saveStatus}>
          {saveStatus === 'saving' && (
            <>
              <span className={styles.saveIndicatorDot} />
              <span className={styles.saveStatusSaving}>Sparar…</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <span className={styles.saveIndicatorDot} />
              <span className={styles.saveStatusSaved}>Sparad</span>
            </>
          )}
        </div>
      </div>

      {/* Photos */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Foton</h2>
        <div className={styles.photoGridWrapper}>
          <PhotoGrid photos={photos} onChange={setPhotos} />
        </div>
        <p className={styles.photoGridHint}>
          Dra och släpp för att ändra ordning. Första fotot visas som profilbild.
        </p>
      </div>

      <div className={styles.divider} />

      {/* Basic info */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Om mig</h2>
        <div className={styles.fieldGroup}>
          <Input
            label="Visningsnamn"
            value={displayName}
            onChange={handleDisplayNameChange}
            placeholder="Ditt visningsnamn"
          />

          <div className={styles.textareaWrapper}>
            <label className={styles.textareaLabel}>Bio</label>
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={handleBioChange}
              placeholder="Berätta om dig själv…"
              maxLength={500}
              rows={4}
            />
            <span
              className={[
                styles.charCount,
                bio.length > 450 ? styles.charCountWarning : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {bio.length}/500
            </span>
          </div>
        </div>
      </div>

      {/* Prompts */}
      {localPrompts.length > 0 && (
        <>
          <div className={styles.divider} />
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Frågor &amp; svar</h2>
            <div className={styles.fieldGroup}>
              {localPrompts.map((prompt) => (
                <div key={prompt.id} className={styles.promptItem}>
                  <p className={styles.promptQuestion}>
                    {PROMPT_LABELS[prompt.promptKey] ?? prompt.promptKey}
                  </p>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      className={styles.textarea}
                      value={prompt.response}
                      onChange={(e) => handlePromptResponseChange(prompt.id, e.target.value)}
                      placeholder="Ditt svar…"
                      maxLength={300}
                      rows={3}
                    />
                    <span
                      className={[
                        styles.charCount,
                        prompt.response.length > 260 ? styles.charCountWarning : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {prompt.response.length}/300
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
