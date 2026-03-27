/**
 * PaperGrain
 *
 * Subtle SVG fractal noise overlay that adds a tactile, printed quality to the
 * interface.  Opacity is 0.03 — felt rather than seen.  The grain sits above
 * all content (z-index: var(--z-toast)) so it unifies every surface, but it
 * never intercepts pointer events.
 *
 * No 'use client' needed — pure HTML + CSS, no JavaScript or browser APIs.
 */
import styles from './PaperGrain.module.css'

export function PaperGrain() {
  return (
    <div
      className={styles.grain}
      aria-hidden="true"
      role="presentation"
    />
  )
}
