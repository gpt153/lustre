/**
 * useAccessibility
 *
 * Provides accessibility state and motion helpers for the Lustre mobile app.
 *
 * - reducedMotion   — true when the OS "Reduce Motion" setting is enabled
 *                     (sourced from Reanimated's useReducedMotion for automatic
 *                      integration with all animated values)
 * - screenReaderEnabled — true when VoiceOver (iOS) or TalkBack (Android) is active
 * - getSpring(key)  — returns the appropriate spring config for the key,
 *                     substituting REDUCED_MOTION.spring when reducedMotion is true
 */

import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'
import { useReducedMotion } from 'react-native-reanimated'
import { SPRING, REDUCED_MOTION } from '@/constants/animations'
import type { SpringKey } from '@/constants/animations'

/** Structural shape shared by all spring config objects. */
export interface SpringConfig {
  damping: number
  stiffness: number
  mass: number
}

export interface AccessibilityState {
  /** True when the OS reduce-motion preference is active. */
  reducedMotion: boolean
  /** True when a screen reader (VoiceOver / TalkBack) is running. */
  screenReaderEnabled: boolean
  /**
   * Returns the Reanimated spring config for the given SPRING key.
   * Automatically substitutes REDUCED_MOTION.spring when reducedMotion is true.
   */
  getSpring: (key: SpringKey) => SpringConfig
}

export function useAccessibility(): AccessibilityState {
  const reducedMotion = useReducedMotion()
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false)

  useEffect(() => {
    // Seed the initial value.
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled)

    // Listen for runtime changes (user toggles VoiceOver/TalkBack mid-session).
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled,
    )

    return () => subscription.remove()
  }, [])

  function getSpring(key: SpringKey): SpringConfig {
    return reducedMotion ? REDUCED_MOTION.spring : SPRING[key]
  }

  return {
    reducedMotion: reducedMotion ?? false,
    screenReaderEnabled,
    getSpring,
  }
}
