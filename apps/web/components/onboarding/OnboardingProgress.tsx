'use client'

import styles from './OnboardingProgress.module.css'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}

export default function OnboardingProgress({
  currentStep,
  totalSteps,
  stepLabels,
}: OnboardingProgressProps) {
  const percent = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className={styles.container} role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      {/* Progress bar */}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Step dots */}
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <span
              key={stepNum}
              className={[
                styles.dot,
                isCompleted ? styles.dotCompleted : '',
                isCurrent ? styles.dotCurrent : '',
              ]
                .filter(Boolean)
                .join(' ')}
              title={stepLabels?.[i]}
            >
              {isCompleted && (
                <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M2 5l2.5 2.5L8 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          )
        })}
      </div>

      {/* Step label */}
      <p className={styles.label} aria-live="polite">
        Steg {currentStep} av {totalSteps}
        {stepLabels?.[currentStep - 1] ? ` — ${stepLabels[currentStep - 1]}` : ''}
      </p>
    </div>
  )
}
