'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
  className?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled = false,
      children,
      className,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      loading ? styles.loading : '',
      isDisabled && !loading ? styles.disabled : '',
      fullWidth ? styles.fullWidth : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={classNames}
        {...rest}
      >
        {/* Hide text content while loading so spinner is centered */}
        <span className={loading ? styles.contentHidden : undefined}>
          {children}
        </span>

        {loading && (
          <span className={styles.loadingContent} aria-hidden="true">
            <span className={styles.spinner} />
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
