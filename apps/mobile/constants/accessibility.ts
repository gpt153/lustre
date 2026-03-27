/**
 * Lustre Mobile Accessibility Constants
 *
 * Touch target sizing and hit-slop values that ensure all interactive elements
 * meet the WCAG 2.1 / Apple HIG / Android Material minimum of 44×44pt.
 */

/** Minimum touch target dimension in logical pixels (44pt per WCAG 2.1 SC 2.5.5). */
export const MIN_TOUCH_TARGET = 44

/**
 * Default hitSlop applied to interactive elements whose visual size is
 * smaller than MIN_TOUCH_TARGET.  Adds 12pt of tap area on every side,
 * bringing a 20pt icon up to 44pt without changing its visual footprint.
 */
export const HIT_SLOP_DEFAULT = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
} as const
