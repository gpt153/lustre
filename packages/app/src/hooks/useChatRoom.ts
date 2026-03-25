import { useEffect, useRef, useState } from 'react'
import * as ScreenCapture from 'expo-screen-capture'
import { trpc } from '@lustre/api'
import { useAuthStore } from '../stores/authStore'
import { Socket as PhoenixSocket, Channel } from 'phoenix'

interface Message {
  id: string
  content: string | null
  type: string
  status: string
  mediaUrl: string | null
  deletedAt: Date | null
  createdAt: Date
  sender: {
    id: string
    displayName: string | null
    photoUrl: string | null
  }
}

export interface ScreenshotEvent {
  user_id: string
  at: string
}

export function useChatRoom(conversationId: string, onScreenshotTaken?: (event: ScreenshotEvent) => void) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const userId = useAuthStore((state) => state.userId)

  const [messages, setMessages] = useState<Message[]>([])
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const messagesQuery = trpc.conversation.getMessages.useQuery({ conversationId, limit: 50 })
  const markReadMutation = trpc.conversation.markRead.useMutation()

  const channelRef = useRef<Channel | null>(null)
  const socketRef = useRef<PhoenixSocket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize messages from query
  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data)
    }
  }, [messagesQuery.data])

  // Mark conversation as read on mount
  useEffect(() => {
    markReadMutation.mutate({ conversationId })
  }, [conversationId, markReadMutation])

  // Setup WebSocket connection
  useEffect(() => {
    if (!accessToken || !userId || !conversationId) return

    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'wss://ws.lovelustre.com/socket'

    const socket = new PhoenixSocket(wsUrl, {
      params: { token: accessToken },
    })

    socketRef.current = socket
    socket.connect()

    const channel = socket.channel(`conversation:${conversationId}`, {})
    channelRef.current = channel

    // Listen for incoming messages
    channel.on('new_message', (data: any) => {
      const newMessage: Message = {
        id: data.id,
        content: data.content,
        type: data.type,
        status: data.status,
        mediaUrl: data.mediaUrl,
        deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
        createdAt: new Date(data.createdAt),
        sender: {
          id: data.senderId,
          displayName: data.senderDisplayName,
          photoUrl: data.senderPhotoUrl,
        },
      }
      setMessages((prev) => [...prev, newMessage])
    })

    // Listen for typing indicator
    channel.on('user_typing', (data: any) => {
      setIsTyping(data.typing ?? false)
    })

    // Listen for screenshot_taken event
    channel.on('screenshot_taken', (data: any) => {
      if (onScreenshotTaken) {
        onScreenshotTaken({
          user_id: data.user_id,
          at: data.at,
        })
      }
    })

    // Join channel
    channel
      .join()
      .receive('ok', () => {
        // Channel joined successfully
      })
      .receive('error', () => {
        // Handle join error
      })

    return () => {
      if (channelRef.current) {
        channelRef.current.leave()
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [accessToken, userId, conversationId])

  // Setup screenshot listener (iOS only)
  useEffect(() => {
    let subscription: any = null

    const setupScreenshotListener = async () => {
      try {
        subscription = ScreenCapture.addScreenshotListener(() => {
          if (channelRef.current) {
            channelRef.current.push('screenshot_taken', {})
          }
        })
      } catch (error) {
        // Screenshot listener not supported (e.g., Android has native FLAG_SECURE blocking)
      }
    }

    setupScreenshotListener()

    return () => {
      if (subscription) {
        subscription.remove()
      }
    }
  }, [])

  const sendMessage = async (content: string) => {
    if (!channelRef.current || !content.trim()) return

    setSendingMessage(true)
    try {
      await new Promise<void>((resolve, reject) => {
        channelRef.current!.push('send_message', { content })
          .receive('ok', () => resolve())
          .receive('error', () => reject(new Error('Failed to send message')))
          .receive('timeout', () => reject(new Error('Message send timeout')))
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const sendTyping = (isTyping: boolean) => {
    if (!channelRef.current) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTyping) {
      channelRef.current.push('typing_start', {})

      // Auto-send typing_stop after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.push('typing_stop', {})
        }
      }, 2000)
    } else {
      channelRef.current.push('typing_stop', {})
    }
  }

  return {
    messages,
    isLoading: messagesQuery.isLoading,
    sendMessage,
    sendingMessage,
    sendTyping,
    isTyping,
  }
}
