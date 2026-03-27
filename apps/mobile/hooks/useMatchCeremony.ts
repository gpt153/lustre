/**
 * useMatchCeremony
 *
 * Orchestration hook for the Match Ceremony overlay.
 *
 * State machine:
 *   idle → running → ctas_visible → dismissed
 *
 * Timers:
 *   t=0      — particles burst + haptic light
 *   t=400ms  — photos land + haptic medium
 *   t=600ms  — text appears + haptic success
 *   t=5000ms — CTAs fade in
 *   t=8000ms — auto-dismiss
 */

import { useCallback, useRef, useState } from 'react'
import * as Haptics from 'expo-haptics'
import { AccessibilityInfo } from 'react-native'

export type CeremonyPhase = 'idle' | 'running' | 'ctas_visible' | 'dismissed'

export interface MatchCeremonyState {
  phase: CeremonyPhase
  particlesActive: boolean
  photosVisible: boolean
  textVisible: boolean
  ctasVisible: boolean
  reducedMotion: boolean
}

export interface UseMatchCeremonyReturn {
  state: MatchCeremonyState
  startCeremony: () => Promise<void>
  skipCeremony: () => void
  dismissCeremony: () => void
}

export function useMatchCeremony(): UseMatchCeremonyReturn {
  const [phase, setPhase] = useState<CeremonyPhase>('idle')
  const [particlesActive, setParticlesActive] = useState(false)
  const [photosVisible, setPhotosVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [ctasVisible, setCtasVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t)
    timersRef.current = []
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }, [])

  const startCeremony = useCallback(async () => {
    clearAllTimers()

    const prefersReduced = await AccessibilityInfo.isReduceMotionEnabled()
    setReducedMotion(prefersReduced)

    if (prefersReduced) {
      // Reduced motion: show everything immediately, skip particles + gradient
      setPhase('running')
      setPhotosVisible(true)
      setTextVisible(true)
      setParticlesActive(false)

      // Still fire haptics
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      schedule(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }, 100)
      schedule(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }, 200)

      schedule(() => {
        setCtasVisible(true)
        setPhase('ctas_visible')
      }, 1000)

      schedule(() => {
        setPhase('dismissed')
      }, 9000)
      return
    }

    // Normal flow
    setPhase('running')
    setPhotosVisible(true)

    // t=0: particle burst + haptic light
    setParticlesActive(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // t=400ms: photos land + haptic medium
    schedule(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }, 400)

    // t=600ms: text appear + haptic success
    schedule(() => {
      setTextVisible(true)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 600)

    // t=5000ms: CTAs fade in
    schedule(() => {
      setCtasVisible(true)
      setPhase('ctas_visible')
    }, 5000)

    // t=8000ms: auto-dismiss
    schedule(() => {
      setPhase('dismissed')
    }, 8000)
  }, [clearAllTimers, schedule])

  const skipCeremony = useCallback(() => {
    clearAllTimers()
    // Jump to final visual state immediately
    setPhotosVisible(true)
    setTextVisible(true)
    setParticlesActive(false)
    setCtasVisible(true)
    setPhase('ctas_visible')

    // Auto-dismiss after a short grace period so user can tap a CTA
    schedule(() => {
      setPhase('dismissed')
    }, 3000)
  }, [clearAllTimers, schedule])

  const dismissCeremony = useCallback(() => {
    clearAllTimers()
    setPhase('dismissed')
  }, [clearAllTimers])

  // Reset to idle when dismissed
  const reset = useCallback(() => {
    setPhase('idle')
    setParticlesActive(false)
    setPhotosVisible(false)
    setTextVisible(false)
    setCtasVisible(false)
    setReducedMotion(false)
  }, [])

  // Expose reset via dismissCeremony follow-through (component calls after fade-out)
  void reset // suppress lint; components call dismissCeremony then unmount

  return {
    state: { phase, particlesActive, photosVisible, textVisible, ctasVisible, reducedMotion },
    startCeremony,
    skipCeremony,
    dismissCeremony,
  }
}
