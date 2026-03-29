'use client'

import { m } from 'motion/react'
import { springs, slideUp } from '@/lib/motion'
import styles from './MessageBubble.module.css'
import PolaroidCard from '@/components/common/PolaroidCard'

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
  senderAvatar?: string
  senderName?: string
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({
  message,
  isOwn,
  showTimestamp = true,
  senderAvatar,
  senderName,
}: MessageBubbleProps) {
  if (!isOwn && senderAvatar) {
    // Received message with mini avatar
    return (
      <m.div
        className={`${styles.wrapper} ${styles.other}`}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={springs.soft}
        aria-label={`${senderName ?? 'Them'}: ${message.body}`}
      >
        <div className={styles.receivedRow}>
          <div className={`${styles.miniAvatar} ${styles.miniAvatarRotatePos}`}>
            <img src={senderAvatar} alt={senderName ?? ''} />
          </div>
          {message.type === 'IMAGE' ? (
            <div className={styles.polaroidWrap}>
              <PolaroidCard
                imageUrl={message.body}
                imageAlt="Shared photo"
                rotation={-2}
                hoverable={false}
                className={styles.chatPolaroid}
              />
            </div>
          ) : (
            <div className={`${styles.bubble} ${styles.bubbleOther}`}>
              <p className={styles.body}>{message.body}</p>
            </div>
          )}
        </div>
        {showTimestamp && (
          <time
            className={`${styles.timestamp} ${styles.timestampOther}`}
            dateTime={message.createdAt}
            style={{ paddingLeft: 44 }}
          >
            {formatTime(message.createdAt)}
          </time>
        )}
      </m.div>
    )
  }

  // Sent message (own) or received without avatar
  return (
    <m.div
      className={`${styles.wrapper} ${isOwn ? styles.own : styles.other}`}
      variants={slideUp}
      initial="initial"
      animate="animate"
      transition={springs.soft}
      aria-label={`${isOwn ? 'You' : 'Them'}: ${message.body}`}
    >
      {message.type === 'IMAGE' ? (
        <div className={styles.polaroidWrap}>
          <PolaroidCard
            imageUrl={message.body}
            imageAlt="Shared photo"
            rotation={isOwn ? 2 : -2}
            hoverable={false}
            className={styles.chatPolaroid}
          />
        </div>
      ) : (
        <div
          className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}
        >
          <p className={styles.body}>{message.body}</p>
        </div>
      )}
      {showTimestamp && (
        <time
          className={`${styles.timestamp} ${isOwn ? styles.timestampOwn : styles.timestampOther}`}
          dateTime={message.createdAt}
          aria-label={`Sent ${formatTime(message.createdAt)}`}
        >
          {isOwn ? `Read ${formatTime(message.createdAt)}` : formatTime(message.createdAt)}
        </time>
      )}
    </m.div>
  )
}
