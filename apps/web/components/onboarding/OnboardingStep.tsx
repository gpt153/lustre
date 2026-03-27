'use client'

import { ReactNode } from 'react'
import { m } from 'motion/react'
import { springs } from '@/lib/motion'
import styles from './OnboardingStep.module.css'

interface OnboardingStepProps {
  stepKey: number | string
  title: string
  description?: string
  direction?: 'forward' | 'backward'
  children: ReactNode
}

export default function OnboardingStep({
  stepKey,
  title,
  description,
  direction = 'forward',
  children,
}: OnboardingStepProps) {
  const xIn = direction === 'forward' ? 40 : -40
  const xOut = direction === 'forward' ? -40 : 40

  return (
    <m.div
      key={stepKey}
      className={styles.step}
      initial={{ opacity: 0, x: xIn }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: xOut }}
      transition={springs.soft}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>

      <div className={styles.body}>
        {children}
      </div>
    </m.div>
  )
}
