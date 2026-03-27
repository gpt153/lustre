'use client'

import { useRef, useEffect } from 'react'
import styles from './Toggle.module.css'

interface ToggleProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

export function Toggle({ id, checked, onChange, disabled = false, label }: ToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      ref={buttonRef}
      id={id}
      className={styles.toggle}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      type="button"
    >
      <span className={styles.toggleKnob} aria-hidden="true" />
    </button>
  )
}
