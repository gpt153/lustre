'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from './CommentSection.module.css'

interface CommentSectionProps {
  postId: string
}

type Comment = {
  id: string
  text: string
  createdAt: Date
  author: { id: string; displayName: string | null; avatarUrl: string | null }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'nu'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

export function CommentSection({ postId: _postId }: CommentSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [comments] = useState<Comment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const totalCount = comments.length
  const displayedComments = showAll ? comments : comments.slice(-3)

  const autoGrow = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [])

  useEffect(() => {
    autoGrow()
  }, [commentText, autoGrow])

  const handleSubmit = async () => {
    const text = commentText.trim()
    if (!text) return
    setSubmitting(true)
    try {
      // Comments will be wired when trpc.post.createComment is added to the router
      await Promise.resolve()
      setCommentText('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={styles.commentSection}>
      {/* View all link */}
      {!showAll && totalCount > 3 && (
        <button
          className={styles.viewAllButton}
          onClick={() => setShowAll(true)}
        >
          Visa alla {totalCount} kommentarer
        </button>
      )}

      {/* Comment list */}
      {displayedComments.length > 0 && (
        <ul className={styles.commentList} aria-label="Kommentarer">
          {displayedComments.map((comment) => (
            <li key={comment.id} className={styles.commentItem}>
              {comment.author.avatarUrl ? (
                <Image
                  src={comment.author.avatarUrl}
                  alt={comment.author.displayName ?? 'Användare'}
                  width={28}
                  height={28}
                  className={styles.commentAvatar}
                />
              ) : (
                <div className={styles.commentAvatarFallback} aria-hidden="true">
                  {(comment.author.displayName ?? '?')[0].toUpperCase()}
                </div>
              )}
              <div className={styles.commentBody}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>
                    {comment.author.displayName ?? 'Anonym'}
                  </span>
                  <time
                    className={styles.commentTime}
                    dateTime={new Date(comment.createdAt).toISOString()}
                  >
                    {getTimeAgo(comment.createdAt)}
                  </time>
                </div>
                <p className={styles.commentText}>{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Comment input */}
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.commentInput}
          placeholder="Skriv en kommentar… (⌘↵ för att skicka)"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={1000}
          aria-label="Skriv en kommentar"
        />
        <button
          className={styles.sendButton}
          onClick={handleSubmit}
          disabled={!commentText.trim() || submitting}
          aria-label="Skicka kommentar"
        >
          {submitting ? '…' : '↑'}
        </button>
      </div>
    </div>
  )
}
