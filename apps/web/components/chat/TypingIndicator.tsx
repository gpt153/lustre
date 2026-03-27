'use client'

import { m, AnimatePresence } from 'motion/react'
import styles from './TypingIndicator.module.css'

interface TypingIndicatorProps {
  name?: string
  visible: boolean
}

export default function TypingIndicator({
  name,
  visible,
}: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {visible && (
        <m.div
          className={styles.container}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          aria-live="polite"
          aria-label={name ? `${name} skriver...` : 'Skriver...'}
        >
          <div className={styles.dots} aria-hidden="true">
            <m.span
              className={styles.dot}
              animate={{ y: [0, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.9,
                delay: 0,
                ease: 'easeInOut',
              }}
            />
            <m.span
              className={styles.dot}
              animate={{ y: [0, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.9,
                delay: 0.18,
                ease: 'easeInOut',
              }}
            />
            <m.span
              className={styles.dot}
              animate={{ y: [0, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.9,
                delay: 0.36,
                ease: 'easeInOut',
              }}
            />
          </div>
          {name && (
            <span className={styles.label}>{name} skriver...</span>
          )}
        </m.div>
      )}
    </AnimatePresence>
  )
}
