import { useCallback, useRef, useEffect, useState } from 'react'
import {
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native'
import { YStack, XStack, Text, Input, Button, Spinner, Separator } from 'tamagui'
import { useChatRoom } from '../hooks/useChatRoom'
import { useAuthStore } from '../stores/authStore'
import { trpc } from '@lustre/api'

interface ChatRoomScreenProps {
  conversationId: string
  displayName: string
}

export function ChatRoomScreen({ conversationId, displayName }: ChatRoomScreenProps) {
  const userId = useAuthStore((state) => state.userId)
  const [screenshotBannerTimer, setScreenshotBannerTimer] = useState<NodeJS.Timeout | null>(null)

  const { messages, isLoading, sendMessage, sendingMessage, sendTyping, isTyping } =
    useChatRoom(conversationId, (event) => {
      setScreenshotBanner(true)
      if (screenshotBannerTimer) clearTimeout(screenshotBannerTimer)
      const timer = setTimeout(() => setScreenshotBanner(false), 3000)
      setScreenshotBannerTimer(timer)
    })

  const [inputText, setInputText] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [screenshotBanner, setScreenshotBanner] = useState(false)
  const [localMessages, setLocalMessages] = useState(messages)
  const flatListRef = useRef<FlatList>(null)

  const deleteMessageMutation = trpc.conversation.deleteMessage.useMutation()

  // Sync local messages with messages from hook
  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (localMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [localMessages])

  const handleSend = useCallback(async () => {
    if (!inputText.trim()) return

    const messageToSend = inputText
    setInputText('')
    setIsComposing(false)
    sendTyping(false)

    await sendMessage(messageToSend)
  }, [inputText, sendMessage, sendTyping])

  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text)

      if (text.length > 0 && !isComposing) {
        setIsComposing(true)
        sendTyping(true)
      } else if (text.length === 0 && isComposing) {
        setIsComposing(false)
        sendTyping(false)
      }
    },
    [isComposing, sendTyping]
  )

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      Alert.alert('Delete message', 'Delete this message?', [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteMessageMutation.mutateAsync({ messageId })
              setLocalMessages((prev) =>
                prev.map((msg) =>
                  msg.id === messageId ? { ...msg, content: null, deletedAt: new Date() } : msg
                )
              )
            } catch (error) {
              console.error('Failed to delete message:', error)
              Alert.alert('Error', 'Failed to delete message')
            }
          },
        },
      ])
    },
    [deleteMessageMutation]
  )

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack flex={1} backgroundColor="$background">
        {/* Screenshot notification banner */}
        {screenshotBanner && (
          <YStack
            backgroundColor="$yellow"
            paddingHorizontal="$3"
            paddingVertical="$2"
            alignItems="center"
          >
            <Text fontSize={14} fontWeight="600" color="$text">
              📸 Screenshot taken
            </Text>
          </YStack>
        )}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={localMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isMyMessage = item.sender.id === userId
            const isImageType = item.type === 'IMAGE'
            const isDeleted = item.deletedAt !== null

            return (
              <TouchableOpacity
                onLongPress={() => isMyMessage && !isDeleted && handleDeleteMessage(item.id)}
                activeOpacity={0.8}
              >
                <YStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  alignItems={isMyMessage ? 'flex-end' : 'flex-start'}
                >
                  <YStack
                    maxWidth="80%"
                    backgroundColor={isMyMessage ? '$primary' : '$card'}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$3"
                  >
                    {/* Deleted message indicator */}
                    {isDeleted ? (
                      <Text
                        color="$textSecondary"
                        fontSize={14}
                        fontStyle="italic"
                        lineHeight={20}
                      >
                        This message was deleted
                      </Text>
                    ) : isImageType && item.mediaUrl ? (
                      <TouchableOpacity activeOpacity={0.8}>
                        <Image
                          source={{ uri: item.mediaUrl }}
                          style={{ width: 200, height: 200, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : (
                      <Text
                        color={isMyMessage ? 'white' : '$text'}
                        fontSize={14}
                        lineHeight={20}
                      >
                        {item.content || '(No content)'}
                      </Text>
                    )}

                    {/* Timestamp */}
                    <Text
                      fontSize={12}
                      color={isMyMessage ? 'rgba(255,255,255,0.7)' : '$textSecondary'}
                      marginTop="$1"
                    >
                      {new Date(item.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </YStack>
                </YStack>
              </TouchableOpacity>
            )
          }}
          inverted
          scrollEventThrottle={16}
          ListEmptyComponent={
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
              <Text color="$textSecondary" fontSize={14}>
                No messages yet. Start the conversation!
              </Text>
            </YStack>
          }
        />

        {/* Typing indicator */}
        {isTyping && (
          <YStack paddingHorizontal="$3" paddingVertical="$2">
            <Text fontSize={12} color="$textSecondary" fontStyle="italic">
              {displayName} is typing...
            </Text>
          </YStack>
        )}

        <Separator />

        {/* Input bar */}
        <XStack
          paddingHorizontal="$3"
          paddingVertical="$2"
          space="$2"
          alignItems="flex-end"
          paddingBottom={Platform.OS === 'ios' ? '$4' : '$2'}
        >
          <Input
            flex={1}
            placeholder={`Message ${displayName}`}
            value={inputText}
            onChangeText={handleInputChange}
            paddingHorizontal="$3"
            paddingVertical="$2"
            fontSize={14}
            borderRadius="$2"
            borderColor="$borderColor"
            borderWidth={1}
            maxHeight={100}
            editable={!sendingMessage}
            multiline
          />

          <Button
            paddingHorizontal="$4"
            paddingVertical="$2"
            backgroundColor="$primary"
            borderRadius="$2"
            disabled={!inputText.trim() || sendingMessage}
            opacity={!inputText.trim() || sendingMessage ? 0.5 : 1}
            onPress={handleSend}
          >
            {sendingMessage ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text color="white" fontWeight="600" fontSize={14}>
                Send
              </Text>
            )}
          </Button>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
