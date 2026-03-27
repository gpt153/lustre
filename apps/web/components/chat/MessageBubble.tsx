'use client'

import { useState } from 'react'
import { trpc } from '@lustre/api'
import styles from './MessageBubble.module.css'

export interface Message {
  id: string
  content: string | null
  type: string
  status: string
  mediaUrl: string | null
  isFiltered: boolean
  deletedAt: Date | null
  createdAt: Date
  sender: {
    id: string
    displayName: string | null
    photoUrl: string | null
  }
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function ReadReceipt({ status }: { status: string }) {
  if (status === 'READ') {
    return <span className={`${styles.receipt} ${styles.receiptRead}`} aria-label="Läst">✓✓</span>
  }
  if (status === 'DELIVERED') {
    return <span className={styles.receipt} aria-label="Levererat">✓✓</span>
  }
  return <span className={styles.receipt} aria-label="Skickat">✓</span>
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const [revealed, setRevealed] = useState(!message.isFiltered || isOwn)
  const revealMutation = trpc.conversation.revealFilteredMedia.useMutation()

  const handleReveal = async () => {
    if (!isOwn && message.type === 'IMAGE' && !revealed) {
      try {
        await revealMutation.mutateAsync({ messageId: message.id })
        setRevealed(true)
      } catch {
        // silently fail; user can retry
      }
    }
  }

  if (message.deletedAt) {
    return (
      <div className={`${styles.row} ${isOwn ? styles.rowOwn : styles.rowOther}`}>
        <div className={`${styles.bubble} ${isOwn ? styles.bubbleSent : styles.bubbleReceived} ${styles.bubbleDeleted}`}>
          <span className={styles.deletedText}>Meddelande borttaget</span>
        </div>
      </div>
    )
  }

  const displayName = message.sender.displayName ?? 'Okänd'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className={`${styles.row} ${isOwn ? styles.rowOwn : styles.rowOther}`}>
      {!isOwn && showAvatar && (
        <div className={styles.avatarWrap} aria-hidden="true">
          {message.sender.photoUrl ? (
            <img
              src={message.sender.photoUrl}
              alt={displayName}
              className={styles.avatar}
              width={28}
              height={28}
            />
          ) : (
            <div className={styles.avatarFallback}>{initial}</div>
          )}
        </div>
      )}

      <div className={`${styles.bubble} ${isOwn ? styles.bubbleSent : styles.bubbleReceived}`}>
        {message.type === 'TEXT' && message.content && (
          <p className={styles.text}>{message.content}</p>
        )}

        {message.type === 'IMAGE' && message.mediaUrl && (
          <div className={styles.mediaWrap}>
            {!revealed ? (
              <div className={styles.filteredMedia}>
                <span className={styles.filteredIcon} aria-hidden="true">🔒</span>
                <span className={styles.filteredLabel}>Innehåll dolt</span>
                {!isOwn && (
                  <button
                    className={styles.revealButton}
                    onClick={handleReveal}
                    disabled={revealMutation.isPending}
                  >
                    {revealMutation.isPending ? 'Laddar…' : 'Visa bild'}
                  </button>
                )}
              </div>
            ) : (
              <img
                src={message.mediaUrl}
                alt="Meddelande"
                className={styles.mediaImage}
                loading="lazy"
              />
            )}
          </div>
        )}

        <div className={styles.meta}>
          <time
            className={styles.time}
            dateTime={new Date(message.createdAt).toISOString()}
          >
            {formatTime(new Date(message.createdAt))}
          </time>
          {isOwn && <ReadReceipt status={message.status} />}
        </div>
      </div>

      {isOwn && showAvatar && (
        <div className={styles.avatarWrap} aria-hidden="true">
          {message.sender.photoUrl ? (
            <img
              src={message.sender.photoUrl}
              alt={displayName}
              className={styles.avatar}
              width={28}
              height={28}
            />
          ) : (
            <div className={styles.avatarFallback}>{initial}</div>
          )}
        </div>
      )}
    </div>
  )
}
