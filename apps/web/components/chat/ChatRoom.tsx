'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { m, AnimatePresence, LazyMotion } from 'motion/react'
import { loadMotionFeatures } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import { useAuthStore } from '@/lib/stores'
import { addToast } from '@/lib/toast-store'
import MessageBubble, { Message } from './MessageBubble'
import MessageInput from './MessageInput'
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
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('sv-SE', {
      weekday: 'long',
      month: 'long',
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

export default function ChatRoom({
  conversationId,
  participantName,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [isTyping] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const userId = useAuthStore.getState().userId ?? 'current-user'

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    })
  }, [])

  useEffect(() => {
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
  }, [conversationId])

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
      addToast('Kunde inte ladda fler meddelanden', 'error')
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

  const handleSend = useCallback(
    async (body: string) => {
      const optimisticMsg: Message = {
        id: `opt-${Date.now()}`,
        senderId: userId,
        body,
        createdAt: new Date().toISOString(),
        type: 'TEXT',
      }

      setMessages((prev) => [...prev, optimisticMsg])
      scrollToBottom(true)

      try {
        await api.conversation.sendMessage?.mutate({
          conversationId,
          body,
          type: 'TEXT',
        })
      } catch {
        // Message stays in UI with optimistic ID — real ID comes via WebSocket
      }
    },
    [conversationId, userId, scrollToBottom]
  )

  const handleTyping = useCallback((typing: boolean) => {
    void typing
    // Emit via WebSocket channel in real implementation
  }, [])

  const messageGroups = groupMessagesByDate(messages)

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState} aria-busy="true" aria-label="Laddar meddelanden">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={`${styles.skeletonBubble} ${i % 2 === 0 ? styles.skeletonLeft : styles.skeletonRight}`}
            />
          ))}
        </div>
        <MessageInput onSend={handleSend} disabled />
      </div>
    )
  }

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <div className={styles.container}>
        {/* Header */}
        {participantName && (
          <div className={styles.header}>
            <div className={styles.headerAvatar}>
              {participantName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.headerInfo}>
              <span className={styles.headerName}>{participantName}</span>
              <span className={styles.headerStatus}>Aktiv nyligen</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className={styles.messageList}
          role="log"
          aria-live="polite"
          aria-label="Konversation"
          onScroll={handleScroll}
        >
          {loadingMore && (
            <div className={styles.loadingMore} aria-label="Laddar äldre meddelanden">
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
                  />
                ))}
              </m.div>
            ))}
          </AnimatePresence>

          <TypingIndicator visible={isTyping} name={participantName} />

          <div ref={bottomRef} aria-hidden="true" />
        </div>

        {/* Input */}
        <MessageInput
          onSend={handleSend}
          onTyping={handleTyping}
        />
      </div>
    </LazyMotion>
  )
}
