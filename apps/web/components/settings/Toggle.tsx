'use client'

import styles from './Toggle.module.css'

interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  id?: string
}

export default function Toggle({
  value,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: ToggleProps) {
  const toggleId = id ?? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelGroup}>
        <span id={`${toggleId}-label`} className={styles.label}>
          {label}
        </span>
        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-labelledby={`${toggleId}-label`}
        aria-disabled={disabled}
        disabled={disabled}
        className={styles.track}
        onClick={() => !disabled && onChange(!value)}
      >
        <span className={styles.knob} aria-hidden="true" />
      </button>
    </div>
  )
}
