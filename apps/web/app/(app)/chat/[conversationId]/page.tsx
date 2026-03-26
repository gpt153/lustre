'use client'

import { useState, useEffect, useRef, useCallback, use } from 'react'
import { YStack, XStack, Text, Spinner, Button, Input, ScrollView, Avatar, Image as TamagaUI_Image } from 'tamagui'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Socket } from 'phoenix'

interface Message {
  id: string
  content: string
  type: string
  status: string
  mediaUrl: string | null
  isFiltered: boolean
  deletedAt: Date | null
  createdAt: Date
  sender: {
    id: string
    displayName: string | null
    photoUrl: string | null
  }
}

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

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = use(params)
  const { userId } = useAuthStore()
  const router = useRouter()

  const { data: conversations } = trpc.conversation.list.useQuery({})
  const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = trpc.conversation.getMessages.useQuery({
    conversationId,
    limit: 50,
  })
  const { refetch: refetchConversations } = trpc.conversation.list.useQuery({})
  const markReadMutation = trpc.conversation.markRead.useMutation()
  const initiateMutation = trpc.call.initiate.useMutation()

  const messages: Message[] = messagesData?.messages ?? []
  const currentConversation = conversations?.find((c) => c.id === conversationId)
  const otherUser = currentConversation?.otherParticipant
  const otherParticipantName = otherUser?.displayName ?? null

  const handleInitiateCall = useCallback(async (callType: 'VOICE' | 'VIDEO') => {
    try {
      const result = await initiateMutation.mutateAsync({
        conversationId: conversationId,
        callType,
      })
      router.push(`/call/${result.callId}?conversationId=${conversationId}&displayName=${encodeURIComponent(otherParticipantName ?? 'Unknown')}`)
    } catch (err) {
      console.error('Failed to initiate call', err)
    }
  }, [initiateMutation, conversationId, otherParticipantName, router])

  // Mark conversation as read when it loads
  useEffect(() => {
    if (conversationId && userId) {
      markReadMutation.mutate({ conversationId })
    }
  }, [conversationId, userId, markReadMutation])

  // WebSocket setup for real-time messages and typing
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const socketRef = useRef<Socket | null>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'wss://ws.lovelustre.com/socket'
    const token = useAuthStore.getState().accessToken

    if (!token || !conversationId) return

    try {
      socketRef.current = new Socket(wsUrl, {
        params: { token },
      })

      socketRef.current.connect()

      const channel = socketRef.current.channel(`conversation:${conversationId}`, {})

      channel.on('new_message', (_payload: any) => {
        refetchMessages()
        refetchConversations()
      })

      channel.on('user_typing', ({ userId: typingUserId }: { userId: string }) => {
        setTypingUsers((prev) => new Set([...prev, typingUserId]))
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev)
            next.delete(typingUserId)
            return next
          })
        }, 3000)
      })

      channel.join()
      channelRef.current = channel

      return () => {
        if (channelRef.current) {
          channelRef.current.leave()
        }
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    } catch (error) {
      console.error('WebSocket error:', error)
    }
  }, [conversationId])

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
        <ConversationListView conversationId={conversationId} />
      </YStack>

      {/* Right panel - chat room */}
      <YStack flex={1} backgroundColor="$background">
        {isLoadingMessages ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner color="$primary" />
          </YStack>
        ) : (
          <>
            {/* Chat header */}
            <XStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
              alignItems="center"
              gap="$3"
            >
              <Avatar circular size="$4" backgroundColor="$primary">
                {otherUser?.photoUrl && <Avatar.Image source={{ uri: otherUser.photoUrl }} />}
                <Avatar.Fallback>
                  {(otherUser?.displayName ?? 'U').charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
              <YStack flex={1}>
                <Text fontWeight="600" fontSize="$4">
                  {otherUser?.displayName ?? 'Unknown User'}
                </Text>
              </YStack>
              <XStack gap="$2">
                <Button size="$3" onPress={() => handleInitiateCall('VOICE')} chromeless>
                  📞
                </Button>
                <Button size="$3" onPress={() => handleInitiateCall('VIDEO')} chromeless>
                  🎥
                </Button>
              </XStack>
            </XStack>

            {/* Messages */}
            <MessageList messages={messages} currentUserId={userId} />

            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <YStack paddingHorizontal="$4" paddingVertical="$2">
                <Text color="$textSecondary" fontSize="$2">
                  Someone is typing...
                </Text>
              </YStack>
            )}

            {/* Input */}
            <MessageInput conversationId={conversationId} onMessageSent={() => {}} />
          </>
        )}
      </YStack>
    </XStack>
  )
}

function ConversationListView({ conversationId }: { conversationId: string }) {
  const { data: conversations, isLoading } = trpc.conversation.list.useQuery({})
  const conversationList = conversations ?? []

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
        {conversationList.length === 0 ? (
          <YStack padding="$4" alignItems="center" justifyContent="center" minHeight="100%">
            <Text color="$textSecondary" fontSize="$3">
              No conversations
            </Text>
          </YStack>
        ) : (
          conversationList.map((conversation) => (
            <ConversationItemWithHighlight
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === conversationId}
            />
          ))
        )}
      </YStack>
    </ScrollView>
  )
}

function ConversationItemWithHighlight({
  conversation,
  isActive,
}: {
  conversation: any
  isActive: boolean
}) {
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
        backgroundColor={isActive ? '$borderColor' : '$background'}
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

function MessageList({
  messages,
  currentUserId,
}: {
  messages: Message[]
  currentUserId: string | null
}) {
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd()
      }
    }, 0)
  }, [messages])

  if (messages.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$textSecondary">No messages yet. Start the conversation!</Text>
      </YStack>
    )
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      flex={1}
      paddingHorizontal="$4"
      paddingVertical="$4"
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
    >
      <YStack gap="$3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender.id === currentUserId}
          />
        ))}
      </YStack>
    </ScrollView>
  )
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message
  isOwn: boolean
}) {
  const [revealed, setRevealed] = useState(!message.isFiltered || isOwn)
  const revealMutation = trpc.conversation.revealFilteredMedia.useMutation()

  const handleReveal = async () => {
    if (!isOwn && message.type === 'IMAGE' && !revealed) {
      try {
        await revealMutation.mutateAsync({ messageId: message.id })
        setRevealed(true)
      } catch (error) {
        console.error('Failed to reveal image:', error)
      }
    }
  }

  return (
    <XStack
      justifyContent={isOwn ? 'flex-end' : 'flex-start'}
      gap="$2"
      alignItems="flex-end"
    >
      {!isOwn && (
        <Avatar circular size="$3" backgroundColor="$primary">
          {message.sender.photoUrl && (
            <Avatar.Image source={{ uri: message.sender.photoUrl }} />
          )}
          <Avatar.Fallback>
            {(message.sender.displayName ?? 'U').charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
      )}

      <YStack
        maxWidth="70%"
        backgroundColor={isOwn ? '$primary' : '$borderColor'}
        borderRadius="$3"
        paddingHorizontal="$3"
        paddingVertical="$2"
      >
        {message.type === 'TEXT' && (
          <Text color={isOwn ? 'white' : '$text'}>
            {message.content}
          </Text>
        )}

        {message.type === 'IMAGE' && message.mediaUrl && (
          <>
            {!revealed ? (
              <YStack alignItems="center" gap="$2">
                <Text color={isOwn ? 'white' : '$text'} fontSize="$2">
                  🔒 Content hidden
                </Text>
                {!isOwn && (
                  <Button
                    size="$2"
                    onPress={handleReveal}
                    disabled={revealMutation.isPending}
                  >
                    <Text fontSize="$2">Reveal</Text>
                  </Button>
                )}
              </YStack>
            ) : (
              <TamagaUI_Image
                source={{ uri: message.mediaUrl }}
                width={200}
                height={200}
                borderRadius="$2"
              />
            )}
          </>
        )}

        <XStack gap="$2" marginTop="$1" justifyContent="flex-end">
          <Text
            color={isOwn ? 'rgba(255,255,255,0.7)' : '$textSecondary'}
            fontSize="$1"
          >
            {formatTime(new Date(message.createdAt))}
          </Text>
          {isOwn && message.status && (
            <Text color="rgba(255,255,255,0.7)" fontSize="$1">
              {message.status === 'DELIVERED' && '✓✓'}
              {message.status === 'READ' && '✓✓'}
              {message.status === 'SENT' && '✓'}
            </Text>
          )}
        </XStack>
      </YStack>

      {isOwn && (
        <Avatar circular size="$3" backgroundColor="$primary">
          {message.sender.photoUrl && (
            <Avatar.Image source={{ uri: message.sender.photoUrl }} />
          )}
          <Avatar.Fallback>
            {(message.sender.displayName ?? 'U').charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
      )}
    </XStack>
  )
}

function MessageInput({
  conversationId,
  onMessageSent,
}: {
  conversationId: string
  onMessageSent: () => void
}) {
  const [content, setContent] = useState('')
  const { userId } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)
  const channelRef = useRef<any>(null)

  // Initialize WebSocket for sending typing indicator
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'wss://ws.lovelustre.com/socket'
    const token = useAuthStore.getState().accessToken

    if (!token || !conversationId) return

    try {
      socketRef.current = new Socket(wsUrl, {
        params: { token },
      })

      socketRef.current.connect()

      const channel = socketRef.current.channel(`conversation:${conversationId}`, {})
      channel.join()
      channelRef.current = channel

      return () => {
        if (channelRef.current) {
          channelRef.current.leave()
        }
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    } catch (error) {
      console.error('WebSocket error:', error)
    }
  }, [conversationId])

  const handleSendMessage = async () => {
    if (!content.trim() || !userId) return

    try {
      setContent('')
      // Send message to backend - wave-3a will implement this endpoint
      // For now, we emit via WebSocket
      if (channelRef.current) {
        channelRef.current.push('send_message', { content })
      }
      onMessageSent()
    } catch (error) {
      console.error('Send error:', error)
    }
  }

  const handleTyping = () => {
    if (channelRef.current) {
      channelRef.current.push('typing', {})
    }
  }

  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      gap="$2"
      alignItems="flex-end"
    >
      <Input
        flex={1}
        placeholder="Type a message..."
        value={content}
        onChangeText={(text) => {
          setContent(text)
          handleTyping()
        }}
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$2"
        paddingHorizontal="$3"
        paddingVertical="$2"
        color="$text"
        placeholderTextColor="$textSecondary"
        multiline
        maxHeight={100}
      />
      <Button
        backgroundColor="$primary"
        borderRadius="$2"
        paddingHorizontal="$3"
        paddingVertical="$2"
        onPress={handleSendMessage}
        disabled={!content.trim()}
      >
        <Text color="white" fontWeight="600">Send</Text>
      </Button>
    </XStack>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (dateOnly.getTime() === today.getTime()) {
    // Today: show time only
    return formatTime(date)
  } else if (dateOnly.getTime() === new Date(today.getTime() - 24 * 60 * 60 * 1000).getTime()) {
    // Yesterday: show "Yesterday"
    return 'Yesterday'
  } else {
    // Other: show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}
