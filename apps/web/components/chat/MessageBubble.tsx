'use client'

import { m } from 'motion/react'
import { springs, slideUp } from '@/lib/motion'
import styles from './MessageBubble.module.css'

export interface Message {
  id: string
  senderId: string
  body: string
  createdAt: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO'
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showTimestamp?: boolean
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({
  message,
  isOwn,
  showTimestamp = true,
}: MessageBubbleProps) {
  return (
    <m.div
      className={`${styles.wrapper} ${isOwn ? styles.own : styles.other}`}
      variants={slideUp}
      initial="initial"
      animate="animate"
      transition={springs.soft}
      aria-label={`${isOwn ? 'Du' : 'Dem'}: ${message.body}`}
    >
      <div
        className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}
      >
        <p className={styles.body}>{message.body}</p>
      </div>
      {showTimestamp && (
        <time
          className={`${styles.timestamp} ${isOwn ? styles.timestampOwn : styles.timestampOther}`}
          dateTime={message.createdAt}
          aria-label={`Skickat ${formatTime(message.createdAt)}`}
        >
          {formatTime(message.createdAt)}
        </time>
      )}
    </m.div>
  )
}
