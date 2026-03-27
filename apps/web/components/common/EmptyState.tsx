import { ReactNode } from 'react'
import Button from './Button'
import styles from './EmptyState.module.css'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  illustration?: ReactNode
  title: string
  description?: string
  action?: EmptyStateAction
}

export default function EmptyState({
  illustration,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.container} role="status" aria-label={title}>
      {illustration && (
        <div className={styles.illustration} aria-hidden="true">
          {illustration}
        </div>
      )}

      <div className={styles.textGroup}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>

      {action && (
        <div className={styles.action}>
          <Button variant="primary" size="md" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
