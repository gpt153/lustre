'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@lustre/api'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatRoom, type Conversation } from '@/components/chat/ChatRoom'
import styles from './ChatLayout.module.css'

export function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'room'>('list')

  const { data: conversations } = trpc.conversation.list.useQuery({})

  // Update tab title with unread count
  useEffect(() => {
    const convList = conversations ?? []
    const total = convList.reduce((sum: number, c: { unreadCount: number }) => sum + c.unreadCount, 0)
    document.title = total > 0 ? `(${total}) Lustre` : 'Lustre'
    return () => {
      document.title = 'Lustre'
    }
  }, [conversations])

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id)
    setMobileView('room')
  }

  const handleBack = () => {
    setMobileView('list')
  }

  const isMobileListHidden = mobileView === 'room'
  const isMobileRoomHidden = mobileView === 'list'

  return (
    <div className={styles.chatLayout}>
      <div
        className={`${styles.conversationList}${isMobileListHidden ? ' ' + styles.hidden : ''}`}
      >
        <ConversationList
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      <div
        className={`${styles.chatRoom}${isMobileRoomHidden ? ' ' + styles.hidden : ''}`}
      >
        <ChatRoom
          conversationId={activeConversationId}
          conversations={(conversations ?? []) as Conversation[]}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}
