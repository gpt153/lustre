/**
 * Lustre Mobile Animation Constants
 *
 * Spring configs are designed for react-native-reanimated withSpring().
 * Timing values are in milliseconds.
 *
 * Pure TypeScript constants — no runtime, no provider.
 */

// ---------------------------------------------------------------------------
// Spring physics configs
// ---------------------------------------------------------------------------

export const SPRING = {
  /** Default card transitions, most UI state changes */
  default: { damping: 20, stiffness: 90, mass: 1 },
  /** Fast snappy feedback — button presses, toggles */
  snappy: { damping: 25, stiffness: 200, mass: 0.8 },
  /** Slow gentle entrance — modals, overlays */
  gentle: { damping: 15, stiffness: 60, mass: 1.2 },
  /** Playful bouncy — match animation, badges */
  bouncy: { damping: 12, stiffness: 150, mass: 0.9 },
  /** Almost no bounce — drawer handles, pickers */
  stiff: { damping: 30, stiffness: 300, mass: 0.7 },
  /** Elastic rubber band — overscroll, drag release */
  rubber: { damping: 40, stiffness: 400, mass: 1 },
} as const

// ---------------------------------------------------------------------------
// Timing values (ms)
// ---------------------------------------------------------------------------

export const TIMING = {
  instant: 100,
  fast: 200,
  medium: 300,
  slow: 600,
  /** Long ambient / looping animations */
  ambient: 8000,
} as const

// ---------------------------------------------------------------------------
// Interaction constants
// ---------------------------------------------------------------------------

export const INTERACTION = {
  /** Scale factor applied to pressable elements on press-in */
  pressScale: 0.97,
  /** Vertical translateY offset for hover lift effect (negative = up) */
  hoverLift: -2,
  /** Delay between staggered list item entrances (ms) */
  staggerDelay: 50,
  /** Long-press threshold (ms) */
  longPressDuration: 500,
  /** Minimum swipe velocity to trigger a card dismiss (px/s) */
  swipeVelocityThreshold: 800,
  /** Minimum swipe distance to trigger a card dismiss (px) */
  swipeDistanceThreshold: 80,
} as const

// ---------------------------------------------------------------------------
// Reduced-motion fallbacks
//
// When the system accessibility setting "Reduce Motion" is enabled, swap
// spring configs for instant durations and interaction constants for
// no-op values:
//
//   import { AccessibilityInfo } from 'react-native'
//   const prefersReducedMotion = AccessibilityInfo.isReduceMotionEnabled()
//   const spring = prefersReducedMotion ? REDUCED_MOTION.spring : SPRING.default
// ---------------------------------------------------------------------------

export const REDUCED_MOTION = {
  spring: { damping: 100, stiffness: 1000, mass: 1 },
  timing: TIMING.instant,
  pressScale: 1,
  hoverLift: 0,
  staggerDelay: 0,
} as const

export type SpringKey = keyof typeof SPRING
export type TimingKey = keyof typeof TIMING
