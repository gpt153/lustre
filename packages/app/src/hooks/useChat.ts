import { trpc } from '@lustre/api'

export function useChat() {
  const conversationsQuery = trpc.conversation.list.useQuery()

  const conversations = conversationsQuery.data ?? []
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount ?? 0), 0)

  return {
    conversations,
    totalUnread,
    isLoading: conversationsQuery.isLoading,
    refetch: conversationsQuery.refetch,
  }
}
