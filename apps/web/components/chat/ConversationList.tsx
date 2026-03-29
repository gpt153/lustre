'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { m, AnimatePresence, LazyMotion } from 'motion/react'
import { loadMotionFeatures, springs, slideInLeft } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import Skeleton from '@/components/common/Skeleton'
import styles from './ConversationList.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', participantName: 'Emma', participantPhoto: '', lastMessage: 'Hej! Hur mår du?', lastMessageAt: '2026-03-27T10:30:00Z', unread: true },
  { id: '2', participantName: 'Sofia', participantPhoto: '', lastMessage: 'Ska vi ses imorgon?', lastMessageAt: '2026-03-27T09:15:00Z', unread: false },
  { id: '3', participantName: 'Lina', participantPhoto: '', lastMessage: 'Tack för en fin kväll! 🌟', lastMessageAt: '2026-03-26T22:00:00Z', unread: false },
  { id: '4', participantName: 'Alex', participantPhoto: '', lastMessage: 'Jag skickade bilden', lastMessageAt: '2026-03-26T18:30:00Z', unread: true },
]

export interface Conversation {
  id: string
  participantName: string
  participantPhoto: string
  lastMessage: string
  lastMessageAt: string
  unread: boolean
}

const AVATAR_ROTATIONS = [
  styles.avatarRotateNeg3,
  styles.avatarRotate2,
  styles.avatarRotateNeg2,
  styles.avatarRotate3,
]

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return 'Nu'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: (id: string) => void
  index: number
}

function ConversationItem({ conversation, isActive, onSelect, index }: ConversationItemProps) {
  const initial = conversation.participantName.charAt(0).toUpperCase()
  const rotationClass = AVATAR_ROTATIONS[index % AVATAR_ROTATIONS.length]

  return (
    <m.div
      className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
      role="option"
      aria-selected={isActive}
      aria-label={`${conversation.participantName}: ${conversation.lastMessage}`}
      onClick={() => onSelect(conversation.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(conversation.id)
        }
      }}
      tabIndex={0}
      variants={slideInLeft}
      initial="initial"
      animate="animate"
      transition={springs.soft}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.avatarWrap}>
        {conversation.participantPhoto ? (
          <div className={`${styles.polaroidAvatar} ${rotationClass}`}>
            <img
              src={conversation.participantPhoto}
              alt={`${conversation.participantName} profile`}
              width={56}
              height={40}
            />
          </div>
        ) : (
          <div className={styles.avatarPlaceholder}>
            <span aria-hidden="true">{initial}</span>
          </div>
        )}
        {conversation.unread && (
          <span className={styles.unreadDot} aria-label="Unread message" />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={`${styles.name} ${conversation.unread ? styles.nameUnread : ''}`}>
            {conversation.participantName}
          </span>
          {conversation.unread ? (
            <div className={styles.unreadDot} style={{ position: 'static', width: 8, height: 8 }} />
          ) : (
            <time
              className={styles.time}
              dateTime={conversation.lastMessageAt}
            >
              {relativeTime(conversation.lastMessageAt)}
            </time>
          )}
        </div>
        <p className={`${styles.preview} ${conversation.unread ? styles.previewUnread : ''}`}>
          {conversation.lastMessage}
        </p>
      </div>
    </m.div>
  )
}

interface ConversationListProps {
  activeConversationId?: string
  conversations?: Conversation[]
  onSelectConversation?: (id: string) => void
}

export default function ConversationList({
  activeConversationId,
  conversations: propConversations,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>(propConversations ?? [])
  const [loading, setLoading] = useState(!propConversations)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (propConversations) {
      setConversations(propConversations)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadConversations() {
      setLoading(true)
      try {
        const result = await api.conversation.list.query()
        if (cancelled) return
        const sorted = [...(result ?? [])].sort(
          (a: Conversation, b: Conversation) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
        setConversations(sorted)
      } catch {
        if (cancelled) return
        setConversations(MOCK_CONVERSATIONS)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadConversations()

    return () => {
      cancelled = true
    }
  }, [propConversations])

  const handleSelect = useCallback(
    (id: string) => {
      if (onSelectConversation) {
        onSelectConversation(id)
      } else {
        router.push(`/chat/${id}`)
      }
    },
    [router, onSelectConversation]
  )

  const currentId =
    activeConversationId ??
    pathname?.match(/\/chat\/([^/]+)/)?.[1]

  if (loading) {
    return (
      <aside className={styles.sidebar} aria-label="Conversations">
        <div className={styles.header}>
          <h2 className={styles.heading}>Conversations</h2>
        </div>
        <div className={styles.list} role="listbox" aria-label="Loading conversations">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <Skeleton shape="circle" width={48} height={48} />
              <div className={styles.skeletonContent}>
                <Skeleton shape="text" width="60%" height={14} />
                <Skeleton shape="text" width="85%" height={12} />
              </div>
            </div>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <aside className={styles.sidebar} aria-label="Conversations">
        <div className={styles.header}>
          <h2 className={styles.heading}>Conversations</h2>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden="true">&#128269;</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search keepsakes..."
            />
          </div>
        </div>

        <div
          className={styles.list}
          role="listbox"
          aria-label="Conversation list"
          aria-activedescendant={currentId ? `conv-${currentId}` : undefined}
        >
          <AnimatePresence initial={false}>
            {conversations.length === 0 ? (
              <m.div
                className={styles.empty}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={styles.emptyIcon} aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="var(--stitch-primary)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
                    <path d="M13 16h14M13 22h9" stroke="var(--stitch-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                  </svg>
                </div>
                <p className={styles.emptyText}>No conversations yet</p>
                <p className={styles.emptySubtext}>Match with someone to start a conversation</p>
              </m.div>
            ) : (
              conversations.map((conv, i) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === currentId}
                  onSelect={handleSelect}
                  index={i}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </aside>
    </LazyMotion>
  )
}
