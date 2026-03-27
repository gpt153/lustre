'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'
import { MessageBubble, type Message } from '@/components/chat/MessageBubble'
import { MessageInput } from '@/components/chat/MessageInput'
import { SkeletonChatMessage } from '@/components/chat/SkeletonChatMessage'
import { EmptyState } from '@/components/common/EmptyState'
import styles from './ChatRoom.module.css'

export interface Conversation {
  id: string
  otherParticipant: {
    userId: string
    displayName: string | null
    photoUrl: string | null
  } | null
  lastMessage: {
    id: string
    content: string | null
    type: string
    createdAt: Date
    senderId: string
  } | null
  unreadCount: number
}

interface ChatRoomProps {
  conversationId: string | null
  conversations: Conversation[]
  onBack: () => void
}

// Plays a short beep via Web Audio API as a sound feedback placeholder
function playSoundFeedback(type: 'send' | 'receive') {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = type === 'send' ? 880 : 660
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
    osc.onended = () => ctx.close()
  } catch {
    // Web Audio unavailable; skip
  }
}

function TypingIndicator() {
  return (
    <div className={styles.typingIndicator} aria-label="Skriver…">
      <div className={styles.typingDots}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  )
}

interface ChatRoomInnerProps {
  conversationId: string
  conversation: Conversation
  onBack: () => void
}

function ChatRoomInner({ conversationId, conversation, onBack }: ChatRoomInnerProps) {
  const { userId } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const socketRef = useRef<any>(null)
  const channelRef = useRef<any>(null)
  const prevMessageCountRef = useRef(0)
  const isMountedRef = useRef(true)

  const { data: messagesData, isLoading, refetch: refetchMessages } = trpc.conversation.getMessages.useQuery({
    conversationId,
    limit: 50,
  })
  const markReadMutation = trpc.conversation.markRead.useMutation()

  // Cast is safe: tRPC infers Prisma enum types; our Message interface uses string for compat
  const messages = (messagesData?.messages ?? []) as unknown as Message[]

  const otherUser = conversation.otherParticipant
  const displayName = otherUser?.displayName ?? 'Okänd'
  const initial = displayName.charAt(0).toUpperCase()

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Play sound on incoming messages
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
      const latest = messages[messages.length - 1]
      if (latest && latest.sender.id !== userId) {
        playSoundFeedback('receive')
      }
    }
    prevMessageCountRef.current = messages.length
  }, [messages, userId])

  // Mark as read
  useEffect(() => {
    if (conversationId && userId) {
      markReadMutation.mutate({ conversationId })
    }
  }, [conversationId, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Phoenix WebSocket
  useEffect(() => {
    isMountedRef.current = true

    const setup = async () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'wss://ws.lovelustre.com/socket'
      const token = useAuthStore.getState().accessToken

      if (!token || !conversationId) return

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error phoenix has no bundled types
        const { Socket } = await import('phoenix')
        const socket = new Socket(wsUrl, { params: { token } })
        socket.connect()
        socketRef.current = socket

        const channel = socket.channel(`conversation:${conversationId}`, {})

        channel.on('new_message', () => {
          if (isMountedRef.current) refetchMessages()
        })

        channel.on('user_typing', ({ userId: typingId }: { userId: string }) => {
          if (!isMountedRef.current || typingId === userId) return
          setTypingUsers((prev) => new Set([...prev, typingId]))
          setTimeout(() => {
            if (!isMountedRef.current) return
            setTypingUsers((prev) => {
              const next = new Set(prev)
              next.delete(typingId)
              return next
            })
          }, 3000)
        })

        channel.join()
        channelRef.current = channel
      } catch {
        // WebSocket unavailable; degrade gracefully
      }
    }

    setup()

    return () => {
      isMountedRef.current = false
      channelRef.current?.leave()
      socketRef.current?.disconnect()
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback((content: string) => {
    if (channelRef.current) {
      channelRef.current.push('send_message', { content, type: 'TEXT' })
      playSoundFeedback('send')
      // Optimistic refetch after a short delay
      setTimeout(() => { if (isMountedRef.current) refetchMessages() }, 300)
    }
  }, [refetchMessages])

  const handleTyping = useCallback(() => {
    channelRef.current?.push('typing_start', {})
  }, [])

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={onBack}
          aria-label="Tillbaka till konversationslistan"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={styles.headerAvatar} aria-hidden="true">
          {otherUser?.photoUrl ? (
            <img src={otherUser.photoUrl} alt={displayName} className={styles.headerAvatarImg} width={36} height={36} />
          ) : (
            <div className={styles.headerAvatarFallback}>{initial}</div>
          )}
        </div>

        <div className={styles.headerInfo}>
          <span className={styles.headerName}>{displayName}</span>
        </div>
      </header>

      {/* Messages */}
      <main className={styles.messages} aria-label="Meddelandelista" aria-live="polite">
        {isLoading ? (
          <div className={styles.loadingMessages}>
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonChatMessage key={i} width={i % 3 === 0 ? '50%' : i % 2 === 0 ? '70%' : '40%'} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            title="Starta konversationen"
            description={`Skicka ett meddelande till ${displayName}`}
          />
        ) : (
          <div className={styles.messageList}>
            {messages.map((msg, i) => {
              const prev = messages[i - 1]
              const showAvatar = !prev || prev.sender.id !== msg.sender.id
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender.id === userId}
                  showAvatar={showAvatar}
                />
              )
            })}
            {typingUsers.size > 0 && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </>
  )
}

export function ChatRoom({ conversationId, conversations, onBack }: ChatRoomProps) {
  if (!conversationId) {
    return (
      <div className={styles.emptyRoom}>
        <div className={styles.emptyRoomInner}>
          <div className={styles.emptyRoomIcon} aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="var(--color-copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className={styles.emptyRoomText}>Välj en konversation för att börja chatta</p>
        </div>
      </div>
    )
  }

  const conversation = conversations.find((c) => c.id === conversationId)

  if (!conversation) {
    return (
      <div className={styles.emptyRoom}>
        <EmptyState title="Konversation hittades inte" description="Kontrollera din konversationslista" />
      </div>
    )
  }

  return (
    <div className={styles.room}>
      <ChatRoomInner
        conversationId={conversationId}
        conversation={conversation}
        onBack={onBack}
      />
    </div>
  )
}
