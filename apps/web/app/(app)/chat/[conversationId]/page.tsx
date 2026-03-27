import ConversationList from '@/components/chat/ConversationList'
import ChatRoom from '@/components/chat/ChatRoom'
import styles from './page.module.css'

interface ChatConversationPageProps {
  params: Promise<{ conversationId: string }>
}

/**
 * Active chat room — /chat/[conversationId]
 *
 * Two-column layout: conversation list on left (with active item highlighted),
 * chat room on right. On mobile, only the chat room is shown.
 */
export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const { conversationId } = await params

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <ConversationList activeConversationId={conversationId} />
      </div>
      <div className={styles.chatArea}>
        <ChatRoom conversationId={conversationId} />
      </div>
    </div>
  )
}
