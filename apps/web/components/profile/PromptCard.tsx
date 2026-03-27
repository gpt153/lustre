'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Card from '@/components/common/Card'
import styles from './PromptCard.module.css'

interface Prompt {
  id: string
  question: string
  answer: string
}

interface PromptCardProps {
  prompt: Prompt
  editable?: boolean
  onSave?: (id: string, answer: string) => Promise<void>
}

export default function PromptCard({ prompt, editable = false, onSave }: PromptCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(prompt.answer)
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(prompt.answer)
  }, [prompt.answer])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(draft.length, draft.length)
    }
  }, [editing, draft.length])

  const handleEdit = useCallback(() => {
    setDraft(prompt.answer)
    setEditing(true)
  }, [prompt.answer])

  const handleCancel = useCallback(() => {
    setDraft(prompt.answer)
    setEditing(false)
  }, [prompt.answer])

  const handleSave = useCallback(async () => {
    if (!onSave || draft.trim() === prompt.answer) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(prompt.id, draft.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }, [onSave, draft, prompt.id, prompt.answer])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') handleCancel()
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
    },
    [handleCancel, handleSave]
  )

  return (
    <article className={styles.wrapper}>
      <Card>
        <div className={styles.inner}>
          <p className={styles.question} id={`prompt-q-${prompt.id}`}>
            {prompt.question}
          </p>

          {editing ? (
            <div className={styles.editArea}>
              <label htmlFor={`prompt-answer-${prompt.id}`} className={styles.srOnly}>
                Svar på frågan: {prompt.question}
              </label>
              <textarea
                id={`prompt-answer-${prompt.id}`}
                ref={textareaRef}
                className={styles.textarea}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                maxLength={300}
                disabled={saving}
                aria-describedby={`prompt-q-${prompt.id}`}
              />
              <div className={styles.editActions}>
                <span className={styles.charCount}>{draft.length}/300</span>
                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving || draft.trim().length === 0}
                    aria-busy={saving}
                  >
                    {saving ? 'Sparar…' : 'Spara'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.answerRow}>
              <p className={styles.answer} aria-describedby={`prompt-q-${prompt.id}`}>
                {prompt.answer}
              </p>
              {editable && (
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={handleEdit}
                  aria-label={`Redigera svar på: ${prompt.question}`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M9.5 1.5a1.5 1.5 0 0 1 2.12 2.12L4.5 10.75l-3 .75.75-3 7.25-7z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
    </article>
  )
}
