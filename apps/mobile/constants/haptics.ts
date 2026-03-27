/**
 * Haptics Patterns for Lustre Mobile
 *
 * Rich haptic pattern presets for 9+ interaction types.
 * All patterns are async functions that return Promise<void>.
 *
 * Import patterns:
 *   import { HAPTIC_PATTERNS, HapticPattern } from '@/constants/haptics'
 *   import { useLustreHaptics } from '@/hooks/useLustreHaptics'
 */

import * as Haptics from 'expo-haptics'

/**
 * Preset haptic patterns mapping interaction types to feedback generators.
 * Each function returns a Promise that resolves when the haptic sequence completes.
 */
export const HAPTIC_PATTERNS = {
  /**
   * Light tap — button press, toggle switch, tab change
   * Single light impact feedback.
   */
  tap: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  },

  /**
   * Medium impact — card swipe confirmation, like action
   * Single medium impact feedback.
   */
  impact: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  },

  /**
   * Heavy thud — match found, ceremony start
   * Single heavy impact feedback.
   */
  heavy: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  },

  /**
   * Success — form submission, consent confirmed
   * System notification feedback for success states.
   */
  success: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  },

  /**
   * Warning — approaching limit, invalid input
   * System notification feedback for warning states.
   */
  warning: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  },

  /**
   * Error — validation failure, blocked action
   * System notification feedback for error states.
   */
  error: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  },

  /**
   * Selection tick — picker scroll, slider snap
   * Light selection feedback.
   */
  selection: async () => {
    await Haptics.selectionAsync()
  },

  /**
   * Double pulse — match ceremony emphasis
   * Two medium impacts with 100ms spacing for celebratory feedback.
   */
  doublePulse: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await new Promise((resolve) => setTimeout(resolve, 100))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  },

  /**
   * Rising sequence — consent progress, level up
   * Three ascending impacts (light → medium → heavy) with 80ms spacing.
   * Creates sense of progression or elevation.
   */
  risingSequence: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await new Promise((resolve) => setTimeout(resolve, 80))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await new Promise((resolve) => setTimeout(resolve, 80))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  },
} as const

/**
 * Type-safe reference to all available haptic patterns.
 * Use with useLustreHaptics().play(pattern) or useLustreHaptics()[pattern]()
 */
export type HapticPattern = keyof typeof HAPTIC_PATTERNS
