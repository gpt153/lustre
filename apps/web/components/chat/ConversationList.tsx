'use client'

import { trpc } from '@lustre/api'
import { SkeletonChatMessage } from '@/components/chat/SkeletonChatMessage'
import styles from './ConversationList.module.css'

interface Conversation {
  id: string
  matchId: string
  createdAt: Date
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

interface ConversationListProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (messageDay.getTime() === today.getTime()) {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  const yesterday = new Date(today.getTime() - 86400000)
  if (messageDay.getTime() === yesterday.getTime()) {
    return 'Igår'
  }
  return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })
}

function getMessagePreview(lastMsg: Conversation['lastMessage']): string {
  if (!lastMsg) return 'Inga meddelanden ännu'
  if (lastMsg.type === 'IMAGE') return 'Bild'
  if (lastMsg.type === 'VIDEO') return 'Video'
  if (!lastMsg.content) return ''
  return lastMsg.content.length > 60 ? lastMsg.content.slice(0, 60) + '…' : lastMsg.content
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
}

function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
  const participant = conversation.otherParticipant
  const displayName = participant?.displayName ?? 'Okänd'
  const initial = displayName.charAt(0).toUpperCase()
  const preview = getMessagePreview(conversation.lastMessage)
  const timestamp = conversation.lastMessage
    ? formatTimestamp(new Date(conversation.lastMessage.createdAt))
    : ''
  const hasUnread = conversation.unreadCount > 0

  return (
    <button
      className={`${styles.item}${isActive ? ' ' + styles.itemActive : ''}`}
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={`Konversation med ${displayName}${hasUnread ? `, ${conversation.unreadCount} olästa` : ''}`}
    >
      <div className={styles.avatarWrap}>
        {participant?.photoUrl ? (
          <img
            src={participant.photoUrl}
            alt={displayName}
            className={styles.avatar}
            width={40}
            height={40}
          />
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            {initial}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={`${styles.name}${hasUnread ? ' ' + styles.nameUnread : ''}`}>
            {displayName}
          </span>
          {timestamp && (
            <span className={`${styles.timestamp}${hasUnread ? ' ' + styles.timestampUnread : ''}`}>
              {timestamp}
            </span>
          )}
        </div>
        <div className={styles.bottomRow}>
          <span className={`${styles.preview}${hasUnread ? ' ' + styles.previewUnread : ''}`}>
            {preview}
          </span>
          {hasUnread && (
            <span className={styles.badge} aria-label={`${conversation.unreadCount} olästa`}>
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export function ConversationList({ activeConversationId, onSelectConversation }: ConversationListProps) {
  const { data: conversations, isLoading } = trpc.conversation.list.useQuery({})
  const convList = (conversations ?? []) as Conversation[]

  if (isLoading) {
    return (
      <div className={styles.loadingList} aria-label="Laddar konversationer">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonChatMessage key={i} width={i % 2 === 0 ? '80%' : '60%'} />
        ))}
      </div>
    )
  }

  if (convList.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon} aria-hidden="true">💬</div>
        <p className={styles.emptyTitle}>Inga konversationer</p>
        <p className={styles.emptyText}>Matcha med någon för att börja chatta</p>
      </div>
    )
  }

  return (
    <nav className={styles.list} aria-label="Konversationer">
      {convList.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
          onSelect={() => onSelectConversation(conv.id)}
        />
      ))}
    </nav>
  )
}
