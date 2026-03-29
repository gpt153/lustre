'use client'

import { useState, useCallback } from 'react'
import PhotoGrid from '@/components/profile/PhotoGrid'
import type { PhotoItem } from '@/components/profile/PhotoGrid'
import styles from './ProfileEditPage.module.css'

interface ProfileFormData {
  firstName: string
  location: string
  bio: string
  interests: string[]
  lookingFor: string[]
  showDistance: boolean
  showAge: boolean
  newMessages: boolean
  discoveryAlerts: boolean
}

interface ProfileEditPageProps {
  photos: PhotoItem[]
  initialData: ProfileFormData
  onSave?: (data: ProfileFormData) => void
  onAddPhoto?: () => void
  onEditPhoto?: (id: string) => void
  onDeletePhoto?: (id: string) => void
}

const LOOKING_FOR_OPTIONS = [
  'Long-term connection',
  'Deep conversation',
  'Shared adventures',
]

export default function ProfileEditPage({
  photos,
  initialData,
  onSave,
  onAddPhoto,
  onEditPhoto,
  onDeletePhoto,
}: ProfileEditPageProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData)

  const updateField = useCallback(<K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const removeInterest = useCallback((interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }, [])

  const addInterest = useCallback(() => {
    const newInterest = prompt('Add interest:')
    if (newInterest && newInterest.trim()) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }))
    }
  }, [])

  const toggleLookingFor = useCallback((option: string) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option)
        ? prev.lookingFor.filter((o) => o !== option)
        : [...prev.lookingFor, option],
    }))
  }, [])

  const handleSave = useCallback(() => {
    onSave?.(formData)
  }, [formData, onSave])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Edit Profile</h1>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Photo Management (40%) */}
        <section className={styles.leftColumn}>
          <PhotoGrid
            photos={photos}
            maxSlots={6}
            onAddPhoto={onAddPhoto}
            onEditPhoto={onEditPhoto}
            onDeletePhoto={onDeletePhoto}
          />
        </section>

        {/* Right Column: Profile Form (60%) */}
        <section className={styles.rightColumn}>
          {/* The Basics */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionHeader}>
              <span className={styles.sectionAccent} />
              The Basics
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="firstName" className={styles.fieldLabel}>
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className={styles.textInput}
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="location" className={styles.fieldLabel}>
                  Location
                </label>
                <div className={styles.locationWrapper}>
                  <span className={styles.locationIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <input
                    id="location"
                    type="text"
                    className={styles.locationInput}
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="bio" className={styles.fieldLabel}>
                Your Story (Bio)
              </label>
              <textarea
                id="bio"
                className={styles.textarea}
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
              />
            </div>

            {/* Interests */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Interests</label>
              <div className={styles.interestsContainer}>
                {formData.interests.map((interest) => (
                  <span key={interest} className={styles.interestTag}>
                    {interest}
                    <button
                      type="button"
                      className={styles.interestTagClose}
                      onClick={() => removeInterest(interest)}
                      aria-label={`Remove ${interest}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  className={styles.addInterestBtn}
                  onClick={addInterest}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Interest
                </button>
              </div>
            </div>

            {/* Looking For */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Looking For</label>
              <div className={styles.lookingForContainer}>
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      formData.lookingFor.includes(option)
                        ? styles.lookingForPillActive
                        : styles.lookingForPill
                    }
                    onClick={() => toggleLookingFor(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & Notifications */}
          <div className={styles.privacyGrid}>
            <div className={styles.privacySection}>
              <h3 className={styles.sectionHeader}>
                <span className={styles.sectionAccent} />
                Privacy
              </h3>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Show my distance</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={formData.showDistance}
                    onChange={(e) => updateField('showDistance', e.target.checked)}
                  />
                  <div className={styles.toggleTrack} />
                </label>
              </div>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Show my age</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={formData.showAge}
                    onChange={(e) => updateField('showAge', e.target.checked)}
                  />
                  <div className={styles.toggleTrack} />
                </label>
              </div>
            </div>

            <div className={styles.privacySection}>
              <h3 className={styles.sectionHeader}>
                <span className={styles.sectionAccent} />
                Notifications
              </h3>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>New Messages</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={formData.newMessages}
                    onChange={(e) => updateField('newMessages', e.target.checked)}
                  />
                  <div className={styles.toggleTrack} />
                </label>
              </div>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Discovery Alerts</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={formData.discoveryAlerts}
                    onChange={(e) => updateField('discoveryAlerts', e.target.checked)}
                  />
                  <div className={styles.toggleTrack} />
                </label>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className={styles.accountSection}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>
                <span className={styles.sectionAccent} />
                Account Settings
              </h3>
              <div className={styles.accountLinks}>
                <button type="button" className={styles.accountLink}>Change Email</button>
                <button type="button" className={styles.accountLink}>Change Password</button>
                <button type="button" className={styles.accountLinkDanger}>Delete Account</button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save Changes
          </button>

          {/* Editorial Footer */}
          <div className={styles.editorialFooter}>
            <p className={styles.editorialText}>Every detail matters.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
