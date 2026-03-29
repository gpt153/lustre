'use client'

import { useEffect, useRef, useState, useCallback, KeyboardEvent, ChangeEvent } from 'react'
import { m, AnimatePresence, LazyMotion } from 'motion/react'
import { loadMotionFeatures } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import { useAuthStore } from '@/lib/stores'
import { addToast } from '@/lib/toast-store'
import MessageBubble, { Message } from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import styles from './ChatRoom.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'other-1', body: 'Hej! Kul att vi matchade 😊', createdAt: '2026-03-27T10:00:00Z', type: 'TEXT' },
  { id: 'm2', senderId: 'current-user', body: 'Hej! Ja verkligen, du verkar jättetrevlig!', createdAt: '2026-03-27T10:05:00Z', type: 'TEXT' },
  { id: 'm3', senderId: 'other-1', body: 'Tack! Vad gör du idag?', createdAt: '2026-03-27T10:10:00Z', type: 'TEXT' },
  { id: 'm4', senderId: 'current-user', body: 'Jobbar hemifrån, men tar en paus snart. Du då?', createdAt: '2026-03-27T10:15:00Z', type: 'TEXT' },
  { id: 'm5', senderId: 'other-1', body: 'Samma här! Ska vi ta en fika nån dag?', createdAt: '2026-03-27T10:20:00Z', type: 'TEXT' },
  { id: 'm6', senderId: 'current-user', body: 'Det låter jättekul! Har du nåt ställe du gillar?', createdAt: '2026-03-27T10:25:00Z', type: 'TEXT' },
  { id: 'm7', senderId: 'other-1', body: 'Hej! Hur mår du?', createdAt: '2026-03-27T10:30:00Z', type: 'TEXT' },
]

interface ChatRoomProps {
  conversationId: string
  participantName?: string
  participantAge?: number
  participantAvatar?: string
  messages?: Message[]
  currentUserId?: string
  isTyping?: boolean
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    if (date !== currentDate) {
      currentDate = date
      groups.push({ date, messages: [msg] })
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  })

  return groups
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ChatRoom({
  conversationId,
  participantName,
  participantAge,
  participantAvatar,
  messages: propMessages,
  currentUserId: propUserId,
  isTyping: propIsTyping,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(propMessages ?? [])
  const [loading, setLoading] = useState(!propMessages)
  const [isTyping] = useState(propIsTyping ?? false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  let userId: string
  try {
    userId = propUserId ?? useAuthStore.getState().userId ?? 'current-user'
  } catch {
    userId = propUserId ?? 'current-user'
  }

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    })
  }, [])

  useEffect(() => {
    if (propMessages) {
      setMessages(propMessages)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadMessages() {
      setLoading(true)
      try {
        const result = await api.conversation.getMessages.query({
          conversationId,
        })
        if (cancelled) return
        setMessages(result.messages ?? result ?? [])
        setCursor(result.nextCursor ?? null)
        setHasMore(!!result.nextCursor)
        await api.conversation.markRead.mutate({ conversationId })
      } catch {
        if (cancelled) return
        setMessages(MOCK_MESSAGES)
        setHasMore(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMessages()

    return () => {
      cancelled = true
    }
  }, [conversationId, propMessages])

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(false)
    }
  }, [loading, messages.length, scrollToBottom])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true)
    }
  }, [messages, scrollToBottom])

  const handleScrollTop = useCallback(async () => {
    const container = scrollContainerRef.current
    if (!container || !hasMore || loadingMore || !cursor) return

    const prevScrollHeight = container.scrollHeight

    setLoadingMore(true)
    try {
      const result = await api.conversation.getMessages.query({
        conversationId,
        cursor,
      })
      const older: Message[] = result.messages ?? result ?? []
      setMessages((prev) => [...older, ...prev])
      setCursor(result.nextCursor ?? null)
      setHasMore(!!result.nextCursor)

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight
        }
      })
    } catch {
      addToast('Could not load more messages', 'error')
    } finally {
      setLoadingMore(false)
    }
  }, [conversationId, cursor, hasMore, loadingMore])

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    if (container.scrollTop < 60) {
      handleScrollTop()
    }
  }, [handleScrollTop])

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const optimisticMsg: Message = {
      id: `opt-${Date.now()}`,
      senderId: userId,
      body: trimmed,
      createdAt: new Date().toISOString(),
      type: 'TEXT',
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setInputValue('')
    scrollToBottom(true)

    if (!propMessages) {
      try {
        api.conversation.sendMessage?.mutate({
          conversationId,
          body: trimmed,
          type: 'TEXT',
        })
      } catch {
        // Message stays in UI with optimistic ID
      }
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [inputValue, userId, conversationId, scrollToBottom, propMessages])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
    },
    []
  )

  const messageGroups = groupMessagesByDate(messages)
  const headerLabel = participantAge
    ? `${participantName}, ${participantAge}`
    : participantName

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState} aria-busy="true" aria-label="Loading messages">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={`${styles.skeletonBubble} ${i % 2 === 0 ? styles.skeletonLeft : styles.skeletonRight}`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <div className={styles.container}>
        {/* Header */}
        {participantName && (
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerName}>{headerLabel}</span>
              <span className={styles.onlineDot} />
            </div>
            <div className={styles.headerActions}>
              <button type="button" className={styles.headerActionBtn} aria-label="Video call" title="Video call">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </button>
              <button type="button" className={styles.headerActionBtn} aria-label="Info" title="Info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className={styles.messageList}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          onScroll={handleScroll}
        >
          {loadingMore && (
            <div className={styles.loadingMore} aria-label="Loading older messages">
              <span className={styles.loadingMoreDot} />
              <span className={styles.loadingMoreDot} />
              <span className={styles.loadingMoreDot} />
            </div>
          )}

          <AnimatePresence initial={false}>
            {messageGroups.map((group) => (
              <m.div key={group.date} className={styles.dateGroup}>
                <div className={styles.dateDivider}>
                  <span className={styles.dateDividerText}>{group.date}</span>
                </div>
                {group.messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === userId}
                    showTimestamp={
                      i === group.messages.length - 1 ||
                      group.messages[i + 1]?.senderId !== msg.senderId
                    }
                    senderAvatar={msg.senderId !== userId ? participantAvatar : undefined}
                    senderName={msg.senderId !== userId ? participantName : undefined}
                  />
                ))}
              </m.div>
            ))}
          </AnimatePresence>

          <TypingIndicator visible={isTyping} name={participantName} />

          <div ref={bottomRef} aria-hidden="true" />
        </div>

        {/* Input Area — Stitch design */}
        <div className={styles.inputArea}>
          <div className={styles.inputRow}>
            <button type="button" className={styles.addButton} aria-label="Add attachment">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </button>
            <input
              ref={inputRef}
              className={styles.inputField}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a note..."
              aria-label="Message text"
            />
            <button
              type="button"
              className={styles.sendButton}
              onClick={handleSend}
              disabled={inputValue.trim().length === 0}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </LazyMotion>
  )
}
