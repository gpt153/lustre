'use client'

import { useState, useCallback, useRef } from 'react'
import Button from '@/components/common/Button'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import styles from './ProfileEdit.module.css'

interface Prompt {
  id: string
  question: string
  answer: string
}

interface ProfileEditProps {
  bio: string
  displayName: string
  prompts: Prompt[]
  onSaved: () => void
  onCancel: () => void
}

export default function ProfileEdit({
  bio: initialBio,
  displayName: initialName,
  prompts: initialPrompts,
  onSaved,
  onCancel,
}: ProfileEditProps) {
  const [bio, setBio] = useState(initialBio)
  const [displayName, setDisplayName] = useState(initialName)
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
  const [saving, setSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePromptChange = useCallback((id: string, answer: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, answer } : p))
    )
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragActive(false), [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handlePhotoUpload(files)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handlePhotoUpload(e.target.files)
    }
  }, [])

  const handlePhotoUpload = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (validFiles.length === 0) {
      addToast('Välj en giltig bildfil', 'error')
      return
    }
    addToast(`Laddar upp ${validFiles.length} foto${validFiles.length > 1 ? 'n' : ''}…`, 'info')
    for (const file of validFiles) {
      const form = new FormData()
      form.append('photo', file)
      try {
        await fetch('/api/photos/upload', { method: 'POST', body: form })
      } catch {
        addToast('Kunde inte ladda upp foto', 'error')
      }
    }
    addToast('Foton sparade', 'success')
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await api.profile.update.mutate({
        bio: bio.trim(),
        displayName: displayName.trim(),
      })
      addToast('Profil sparad', 'success')
      onSaved()
    } catch {
      addToast('Kunde inte spara profilen', 'error')
    } finally {
      setSaving(false)
    }
  }, [bio, displayName, onSaved])

  return (
    <div className={styles.editPanel}>
      <div className={styles.fields}>

        {/* Display name */}
        <div className={styles.field}>
          <label htmlFor="edit-name" className={styles.label}>
            Visningsnamn
          </label>
          <input
            id="edit-name"
            type="text"
            className={styles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={32}
            disabled={saving}
            autoComplete="off"
          />
        </div>

        {/* Bio */}
        <div className={styles.field}>
          <label htmlFor="edit-bio" className={styles.label}>
            Bio
          </label>
          <textarea
            id="edit-bio"
            className={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            disabled={saving}
          />
          <span className={styles.charCount}>{bio.length}/500</span>
        </div>

        {/* Prompt answers */}
        {prompts.length > 0 && (
          <div className={styles.promptsGroup}>
            <h3 className={styles.groupHeading}>Svar på frågor</h3>
            {prompts.map((prompt) => (
              <div key={prompt.id} className={styles.field}>
                <label htmlFor={`edit-prompt-${prompt.id}`} className={styles.label}>
                  <span className={styles.promptQuestion}>{prompt.question}</span>
                </label>
                <textarea
                  id={`edit-prompt-${prompt.id}`}
                  className={styles.textarea}
                  value={prompt.answer}
                  onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
                  maxLength={300}
                  rows={2}
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        )}

        {/* Photo upload zone */}
        <div className={styles.field}>
          <h3 className={styles.groupHeading}>Foton</h3>
          <div
            className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Dra och släpp bilder här eller klicka för att välja"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.fileInput}
              onChange={handleFileInput}
            />
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="2" y="7" width="24" height="17" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="15.5" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 7l1.5-2.5h5L18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.dropZoneText}>
              {dragActive ? 'Släpp bilder här' : 'Dra bilder hit eller klicka för att välja'}
            </span>
            <span className={styles.dropZoneHint}>JPG, PNG, WebP · max 10 MB per bild</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Avbryt
        </Button>
        <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
          Spara profil
        </Button>
      </div>
    </div>
  )
}
