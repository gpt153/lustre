/**
 * useLustreHaptics
 *
 * A hook providing haptic feedback functions with automatic accessibility support.
 * When the OS "Reduce Motion" setting is enabled, all haptic functions become no-ops.
 *
 * Usage:
 *   const haptics = useLustreHaptics()
 *   haptics.tap()           // Light tap on button press
 *   haptics.success()       // Success notification
 *   haptics.play('impact')  // Generic play by pattern name
 *
 * Features:
 * - All haptic functions respect useReducedMotion from react-native-reanimated
 * - Functions are safe to call and never throw; failures are silently caught
 * - Provides both individual haptic methods and a generic play() function
 * - Type-safe pattern names via HapticPattern type
 */

import { useCallback } from 'react'
import { useReducedMotion } from 'react-native-reanimated'
import { HAPTIC_PATTERNS, type HapticPattern } from '@/constants/haptics'

export interface LustreHapticsInterface {
  /** Light tap — button press, toggle switch, tab change */
  tap: () => Promise<void>
  /** Medium impact — card swipe confirmation, like action */
  impact: () => Promise<void>
  /** Heavy thud — match found, ceremony start */
  heavy: () => Promise<void>
  /** Success — form submission, consent confirmed */
  success: () => Promise<void>
  /** Warning — approaching limit, invalid input */
  warning: () => Promise<void>
  /** Error — validation failure, blocked action */
  error: () => Promise<void>
  /** Selection tick — picker scroll, slider snap */
  selection: () => Promise<void>
  /** Double pulse — match ceremony emphasis */
  doublePulse: () => Promise<void>
  /** Rising sequence — consent progress, level up */
  risingSequence: () => Promise<void>
  /**
   * Generic play function for any haptic pattern.
   * Type-safe: pattern must be a key from HAPTIC_PATTERNS.
   */
  play: (pattern: HapticPattern) => Promise<void>
}

/**
 * Hook that provides haptic feedback with automatic accessibility support.
 *
 * All haptic functions:
 * - Return a Promise that resolves when the haptic sequence completes
 * - Become no-ops when useReducedMotion() returns true
 * - Never throw; failures are silently caught for robustness
 *
 * @returns Object with haptic functions (tap, impact, heavy, success, warning, error, selection, doublePulse, risingSequence, play)
 */
export function useLustreHaptics(): LustreHapticsInterface {
  const reducedMotion = useReducedMotion()

  /**
   * Internal helper to wrap haptic execution with accessibility support.
   * Returns immediately if reduced motion is enabled.
   */
  const executeHaptic = useCallback(
    async (pattern: HapticPattern): Promise<void> => {
      // Respect reduced-motion accessibility setting
      if (reducedMotion) {
        return
      }

      try {
        await HAPTIC_PATTERNS[pattern]()
      } catch {
        // Silently catch errors (haptics may be unavailable on some devices)
      }
    },
    [reducedMotion],
  )

  return {
    tap: () => executeHaptic('tap'),
    impact: () => executeHaptic('impact'),
    heavy: () => executeHaptic('heavy'),
    success: () => executeHaptic('success'),
    warning: () => executeHaptic('warning'),
    error: () => executeHaptic('error'),
    selection: () => executeHaptic('selection'),
    doublePulse: () => executeHaptic('doublePulse'),
    risingSequence: () => executeHaptic('risingSequence'),
    play: (pattern: HapticPattern) => executeHaptic(pattern),
  }
}
