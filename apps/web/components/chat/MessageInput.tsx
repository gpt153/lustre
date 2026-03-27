'use client'

import {
  useRef,
  useState,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from 'react'
import Button from '@/components/common/Button'
import styles from './MessageInput.module.css'

interface MessageInputProps {
  onSend: (body: string) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Skriv ett meddelande...',
}: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [])

  const notifyTyping = useCallback(
    (typing: boolean) => {
      if (!onTyping) return
      if (typing === isTypingRef.current) return
      isTypingRef.current = typing
      onTyping(typing)
    },
    [onTyping]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      resizeTextarea()

      if (e.target.value.length > 0) {
        notifyTyping(true)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
          notifyTyping(false)
        }, 2000)
      } else {
        notifyTyping(false)
      }
    },
    [resizeTextarea, notifyTyping]
  )

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')
    notifyTyping(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (el) {
        el.style.height = 'auto'
        el.focus()
      }
    })
  }, [value, disabled, onSend, notifyTyping])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const isEmpty = value.trim().length === 0

  return (
    <div className={styles.container}>
      <div className={styles.inputWrap}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Meddelandetext"
          aria-multiline="true"
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSend}
        disabled={isEmpty || disabled}
        aria-label="Skicka meddelande"
        className={styles.sendButton}
      >
        <SendIcon />
      </Button>
    </div>
  )
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
