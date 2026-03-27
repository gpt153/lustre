'use client'

import { Card } from '@/components/common/Card'
import styles from './PromptCard.module.css'

interface PromptCardProps {
  question: string
  answer: string
}

export function PromptCard({ question, answer }: PromptCardProps) {
  return (
    <Card variant="elevated" className={styles.promptCard}>
      <p className={styles.question}>{question}</p>
      <p className={styles.answer}>{answer}</p>
    </Card>
  )
}
