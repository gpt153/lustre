'use client'

import { useEffect, useCallback, useRef } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { springs, fadeIn, scaleIn } from '@/lib/motion'
import Button from '@/components/common/Button'
import PolaroidCard from '@/components/common/PolaroidCard'
import ParticleBurst from './ParticleBurst'
import styles from './MatchAnimation.module.css'

interface MatchAnimationProps {
  isOpen: boolean
  onClose: () => void
  matchedProfile: {
    id: string
    displayName: string
    photoUrl?: string
  }
  currentUserPhotoUrl?: string
  onSendMessage: (profileId: string) => void
}

async function playMatchSound() {
  const { playSound } = await import('@/lib/sound-manager')
  playSound('match', 0.6)
}

const PHOTO_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect width="120" height="120" fill="%23B87333" rx="60"/%3E%3Ccircle cx="60" cy="46" r="18" fill="rgba(255,255,255,0.4)"/%3E%3Cellipse cx="60" cy="92" rx="28" ry="22" fill="rgba(255,255,255,0.4)"/%3E%3C/svg%3E'

export default function MatchAnimation({
  isOpen,
  onClose,
  matchedProfile,
  currentUserPhotoUrl,
  onSendMessage,
}: MatchAnimationProps) {
  const hasPlayedSound = useRef(false)

  /* Play match sound once when the overlay opens */
  useEffect(() => {
    if (isOpen && !hasPlayedSound.current) {
      hasPlayedSound.current = true
      playMatchSound()
    }
    if (!isOpen) {
      hasPlayedSound.current = false
    }
  }, [isOpen])

  /* Escape key dismissal */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  /* Body scroll lock */
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.top = `-${scrollY}px`
      return () => {
        const top = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.top = ''
        window.scrollTo(0, parseInt(top || '0') * -1)
      }
    }
  }, [isOpen])

  const handleSendMessage = useCallback(() => {
    onSendMessage(matchedProfile.id)
    onClose()
  }, [onSendMessage, matchedProfile.id, onClose])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className={styles.backdrop}
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="initial"
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-label="Det är en match!"
        >
          <m.div
            className={styles.container}
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="initial"
            transition={springs.soft}
          >
            {/* Particle burst — centered behind photos */}
            <div className={styles.particleWrapper}>
              <ParticleBurst active={isOpen} count={28} />
            </div>

            {/* Profile photos row */}
            <div className={styles.photosRow}>
              {/* Current user — tilts left */}
              <m.div
                className={styles.polaroidFrame}
                initial={{ opacity: 0, x: -80, rotate: -15 }}
                animate={{ opacity: 1, x: 0, rotate: -10 }}
                exit={{ opacity: 0, x: -80, rotate: -15 }}
                transition={{ ...springs.bouncy, delay: 0.1 }}
              >
                <PolaroidCard
                  imageUrl={currentUserPhotoUrl ?? PHOTO_PLACEHOLDER}
                  imageAlt="Ditt foto"
                  caption=""
                  hoverable={false}
                  className={styles.matchPolaroid}
                />
              </m.div>

              {/* Heart icon */}
              <m.div
                className={styles.heartIcon}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ ...springs.bouncy, delay: 0.3 }}
                aria-hidden="true"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 28.5C16 28.5 3 20.5 3 11.5C3 7.36 6.36 4 10.5 4C13 4 15.22 5.22 16 7C16.78 5.22 19 4 21.5 4C25.64 4 29 7.36 29 11.5C29 20.5 16 28.5 16 28.5Z"
                    fill="url(#heartGradient)"
                  />
                  <defs>
                    <linearGradient
                      id="heartGradient"
                      x1="3"
                      y1="4"
                      x2="29"
                      y2="28.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#B87333" />
                      <stop offset="1" stopColor="#D4A843" />
                    </linearGradient>
                  </defs>
                </svg>
              </m.div>

              {/* Matched profile — tilts right */}
              <m.div
                className={styles.polaroidFrame}
                initial={{ opacity: 0, x: 80, rotate: 15 }}
                animate={{ opacity: 1, x: 0, rotate: 10 }}
                exit={{ opacity: 0, x: 80, rotate: 15 }}
                transition={{ ...springs.bouncy, delay: 0.1 }}
              >
                <PolaroidCard
                  imageUrl={matchedProfile.photoUrl ?? PHOTO_PLACEHOLDER}
                  imageAlt={`${matchedProfile.displayName}s foto`}
                  caption={matchedProfile.displayName}
                  hoverable={false}
                  className={styles.matchPolaroid}
                />
              </m.div>
            </div>

            {/* Match headline — scales up */}
            <m.h1
              className={styles.heading}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ ...springs.bouncy, delay: 0.3 }}
            >
              Det är en match!
            </m.h1>

            {/* Subtext */}
            <m.p
              className={styles.subtext}
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="initial"
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {matchedProfile.displayName} och du gillar varandra
            </m.p>

            {/* CTA buttons */}
            <m.div
              className={styles.actions}
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="initial"
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <Button variant="primary" size="lg" fullWidth onClick={handleSendMessage}>
                Skicka meddelande
              </Button>
              <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
                Fortsätt bläddra
              </Button>
            </m.div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
