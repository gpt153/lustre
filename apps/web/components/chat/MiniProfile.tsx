'use client'

import styles from './MiniProfile.module.css'

export interface MiniProfileData {
  name: string
  age: number
  location: string
  about: string
  photoUrl: string
  photoCaption?: string
  sharedInterests: string[]
  otherInterests: string[]
}

interface MiniProfileProps {
  profile: MiniProfileData
}

export default function MiniProfile({ profile }: MiniProfileProps) {
  return (
    <aside className={styles.panel} aria-label={`${profile.name}'s profile`}>
      <div className={styles.inner}>
        {/* Large Polaroid Photo */}
        <div className={styles.polaroidPhoto}>
          <div className={styles.polaroidPhotoImage}>
            <img
              src={profile.photoUrl}
              alt={`${profile.name} profile photo`}
            />
            <div className={styles.photoOverlay}>
              <span className={styles.photoOverlayText}>View Gallery</span>
            </div>
          </div>
          {profile.photoCaption && (
            <div className={styles.polaroidCaption}>
              {profile.photoCaption}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className={styles.infoSection}>
          <div>
            <h3 className={styles.profileName}>
              {profile.name}, {profile.age}
            </h3>
            <div className={styles.location}>
              <span className={styles.locationIcon} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              {profile.location}
            </div>
          </div>

          {/* About Me */}
          <div>
            <h4 className={styles.sectionLabel}>About Me</h4>
            <p className={styles.aboutText}>
              &ldquo;{profile.about}&rdquo;
            </p>
          </div>

          {/* Shared Interests */}
          {(profile.sharedInterests.length > 0 || profile.otherInterests.length > 0) && (
            <div>
              <h4 className={styles.sectionLabel}>Shared Interests</h4>
              <div className={styles.interests}>
                {profile.sharedInterests.map((interest) => (
                  <span key={interest} className={`${styles.interestTag} ${styles.interestTagShared}`}>
                    {interest}
                  </span>
                ))}
                {profile.otherInterests.map((interest) => (
                  <span key={interest} className={`${styles.interestTag} ${styles.interestTagRegular}`}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={`${styles.actionBtn} ${styles.blockBtn}`}>
              Block
            </button>
            <button type="button" className={`${styles.actionBtn} ${styles.reportBtn}`}>
              Report
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
