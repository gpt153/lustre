/**
 * AmbientGradient
 *
 * A fixed, full-screen radial gradient that breathes slowly in copper tones.
 * The gradient shifts its center position on a 18-second cycle, giving the
 * app a subtle sense of being alive — like candlelight or warm ambient light.
 *
 * Opacity: 0.05 — felt rather than seen. The copper hue reinforces the brand.
 *
 * No 'use client' needed — pure CSS animation, no JavaScript.
 */
import styles from './AmbientGradient.module.css'

export function AmbientGradient() {
  return (
    <div
      className={styles.ambient}
      aria-hidden="true"
      role="presentation"
    />
  )
}
