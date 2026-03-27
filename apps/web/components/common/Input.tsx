'use client'

import {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  useId,
} from 'react'
import styles from './Input.module.css'

/* ---- Base props shared between input and textarea ---- */

interface BaseInputProps {
  label?: string
  helperText?: string
  error?: boolean
  errorMessage?: string
  className?: string
  required?: boolean
}

/* ---- Input variant ---- */

interface InputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  as?: 'input'
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
}

/* ---- Textarea variant ---- */

interface TextareaProps
  extends BaseInputProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  as: 'textarea'
}

type CombinedInputProps = InputProps | TextareaProps

const ErrorIcon = () => (
  <svg
    className={styles.errorIcon}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11" r="0.75" fill="currentColor" />
  </svg>
)

const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CombinedInputProps
>((props, ref) => {
  const {
    label,
    helperText,
    error = false,
    errorMessage,
    className,
    required,
    ...rest
  } = props

  const autoId = useId()
  const inputId = (rest as InputHTMLAttributes<HTMLInputElement>).id ?? autoId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const describedBy = [
    error && errorMessage ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined

  const isTextarea = (props as TextareaProps).as === 'textarea'

  const inputClass = [
    isTextarea ? styles.textarea : styles.input,
    error ? (isTextarea ? styles.textareaError : styles.inputError) : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {isTextarea ? (
        <textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          id={inputId}
          className={inputClass}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          aria-required={required}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          id={inputId}
          className={inputClass}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          aria-required={required}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && errorMessage && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          <ErrorIcon />
          {errorMessage}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className={styles.helperText}>
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
