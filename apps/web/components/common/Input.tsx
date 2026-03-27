'use client'

import { ChangeEvent } from 'react'
import styles from './Input.module.css'

interface InputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  disabled = false,
  className = '',
}: InputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const inputClass = [
    styles.input,
    error && styles.inputError,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <input
        className={inputClass}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <div className={styles.error} id={`${label}-error`}>
          {error}
        </div>
      )}
    </div>
  )
}
