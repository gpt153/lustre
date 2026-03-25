'use client'

import { YStack, XStack, Text, Spinner, ScrollView, Avatar } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

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
    content: string
    type: string
    createdAt: Date
    senderId: string
  } | null
  unreadCount: number
}

export default function ChatPage() {
  const { data: conversations, isLoading } = trpc.conversation.list.useQuery({})
  const conversationList = conversations ?? []

  return (
    <XStack flex={1} height="100vh">
      {/* Left sidebar - conversation list */}
      <YStack
        width={320}
        borderRightWidth={1}
        borderColor="$borderColor"
        overflow="hidden"
        backgroundColor="$background"
      >
        <ConversationListView conversations={conversationList} isLoading={isLoading} />
      </YStack>

      {/* Right panel - empty state on /chat */}
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text color="$textSecondary" fontSize="$4">
          Select a conversation to start chatting
        </Text>
      </YStack>
    </XStack>
  )
}

function ConversationListView({
  conversations,
  isLoading,
}: {
  conversations: Conversation[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <ScrollView flex={1}>
      <YStack gap="$0">
        {conversations.length === 0 ? (
          <YStack padding="$4" alignItems="center" justifyContent="center" minHeight="100%">
            <Text color="$textSecondary" fontSize="$3">
              No conversations yet
            </Text>
          </YStack>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))
        )}
      </YStack>
    </ScrollView>
  )
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  const otherUser = conversation.otherParticipant
  const lastMsg = conversation.lastMessage

  const displayName = otherUser?.displayName ?? 'Unknown User'
  const photoUrl = otherUser?.photoUrl

  let messagePreview = 'No messages yet'
  if (lastMsg) {
    if (lastMsg.type === 'TEXT') {
      messagePreview = lastMsg.content.substring(0, 50) + (lastMsg.content.length > 50 ? '...' : '')
    } else if (lastMsg.type === 'IMAGE') {
      messagePreview = '📷 Image'
    } else {
      messagePreview = lastMsg.type
    }
  }

  const timestamp = lastMsg ? formatDate(new Date(lastMsg.createdAt)) : ''

  return (
    <Link href={`/chat/${conversation.id}`} style={{ textDecoration: 'none' }}>
      <XStack
        paddingHorizontal="$3"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        alignItems="center"
        gap="$3"
        hoverStyle={{ backgroundColor: '$borderColor' }}
        cursor="pointer"
      >
        <Avatar circular size="$5" backgroundColor="$primary">
          {photoUrl && <Avatar.Image source={{ uri: photoUrl }} />}
          <Avatar.Fallback>{displayName.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>

        <YStack flex={1} gap="$1">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontWeight="600" color="$text" fontSize="$3" numberOfLines={1}>
              {displayName}
            </Text>
            {timestamp && (
              <Text color="$textSecondary" fontSize="$2">
                {timestamp}
              </Text>
            )}
          </XStack>
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$textSecondary" fontSize="$2" numberOfLines={1} flex={1}>
              {messagePreview}
            </Text>
            {conversation.unreadCount > 0 && (
              <YStack
                backgroundColor="$primary"
                borderRadius="$1"
                minWidth={18}
                height={18}
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="$1" fontWeight="600">
                  {conversation.unreadCount}
                </Text>
              </YStack>
            )}
          </XStack>
        </YStack>
      </XStack>
    </Link>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (dateOnly.getTime() === today.getTime()) {
    // Today: show time only
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (dateOnly.getTime() === new Date(today.getTime() - 24 * 60 * 60 * 1000).getTime()) {
    // Yesterday: show "Yesterday"
    return 'Yesterday'
  } else {
    // Other: show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
