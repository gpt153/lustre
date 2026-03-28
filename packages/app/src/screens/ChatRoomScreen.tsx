import { useCallback, useRef, useEffect, useState } from 'react'
import {
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { YStack, XStack, Text, Input, Spinner } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { useChatRoom } from '../hooks/useChatRoom'
import { useAuthStore } from '../stores/authStore'
import { trpc } from '@lustre/api'

const COPPER = '#894d0d'
const COPPER_DARK = '#a76526'
const GOLD = '#D4A843'
const WARM_WHITE = '#fef8f3'
const CHARCOAL = '#2C2421'
const WARM_BEIGE = '#f8f3ee'
const WARM_GRAY = '#8B7E74'

interface ChatRoomScreenProps {
  conversationId: string
  displayName: string
  otherUserId?: string
  otherUserPhotos?: { url: string }[]
  onBack?: () => void
  onInitiateCall?: (callId: string, callType: 'VOICE' | 'VIDEO') => void
}

export function ChatRoomScreen({
  conversationId,
  displayName,
  otherUserId,
  otherUserPhotos,
  onBack,
  onInitiateCall,
}: ChatRoomScreenProps) {
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
  const initiateMutation = trpc.call.initiate.useMutation()

  // Fetch other user's photos if not provided via props
  const profileQuery = trpc.profile.getPublic.useQuery(
    { userId: otherUserId! },
    { enabled: !!otherUserId && !otherUserPhotos }
  )
  const photos = otherUserPhotos || profileQuery.data?.photos || []

  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

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

  const handleInitiateCall = useCallback(
    async (callType: 'VOICE' | 'VIDEO') => {
      try {
        const result = await initiateMutation.mutateAsync({ conversationId, callType })
        onInitiateCall?.(result.callId, callType)
      } catch (err) {
        console.error('Failed to initiate call', err)
      }
    },
    [conversationId, initiateMutation, onInitiateCall]
  )

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      Alert.alert('Radera meddelande', 'Vill du radera detta meddelande?', [
        { text: 'Avbryt', onPress: () => {} },
        {
          text: 'Radera',
          style: 'destructive',
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
              Alert.alert('Fel', 'Kunde inte radera meddelandet')
            }
          },
        },
      ])
    },
    [deleteMessageMutation]
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={WARM_WHITE}>
        <Spinner color={COPPER} />
      </YStack>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack flex={1} backgroundColor={WARM_WHITE}>
        {/* Header */}
        <YStack
          paddingTop={Platform.OS === 'ios' ? 56 : 16}
          paddingHorizontal={20}
          paddingBottom={8}
          backgroundColor={`${WARM_WHITE}E6`}
          borderBottomWidth={0}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <TouchableOpacity
              onPress={onBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text fontSize={24} color={COPPER}>←</Text>
            </TouchableOpacity>

            <YStack alignItems="center">
              <Text
                fontSize={18}
                fontWeight="700"
                color={CHARCOAL}
                fontFamily="$heading"
              >
                {displayName}
              </Text>
              <Text
                fontSize={10}
                color={WARM_GRAY}
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                I Stockholm nu
              </Text>
            </YStack>

            <XStack gap={4}>
              <TouchableOpacity
                onPress={() => handleInitiateCall('VIDEO')}
                style={styles.headerIcon}
              >
                <Text fontSize={20} color={COPPER}>📹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleInitiateCall('VOICE')}
                style={styles.headerIcon}
              >
                <Text fontSize={20} color={COPPER}>📞</Text>
              </TouchableOpacity>
            </XStack>
          </XStack>
        </YStack>

        {/* Profile Photo Strip — rectangular thumbnails */}
        {photos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoStrip}
          >
            {photos.map((photo, index) => (
              <YStack key={index} style={styles.photoThumb}>
                <Image
                  source={{ uri: photo.url }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                {index === 0 && <YStack style={styles.onlineDot} />}
              </YStack>
            ))}
          </ScrollView>
        )}

        {/* Screenshot notification banner */}
        {screenshotBanner && (
          <YStack
            backgroundColor="#FFF3CD"
            paddingHorizontal={16}
            paddingVertical={8}
            alignItems="center"
          >
            <Text fontSize={13} fontWeight="600" color={CHARCOAL}>
              📸 Skärmdump tagen
            </Text>
          </YStack>
        )}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={localMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item, index }) => {
            const isMyMessage = item.sender.id === userId
            const isImageType = item.type === 'IMAGE'
            const isDeleted = item.deletedAt !== null
            const isLastSent =
              isMyMessage &&
              index === localMessages.length - 1

            // Show date separator for first message
            const showDateSep = index === 0

            return (
              <>
                {showDateSep && (
                  <YStack alignItems="center" paddingVertical={16}>
                    <Text
                      fontSize={10}
                      color={`${WARM_GRAY}99`}
                      textTransform="uppercase"
                      letterSpacing={1}
                    >
                      IDAG {new Date(item.createdAt).toLocaleTimeString('sv-SE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </YStack>
                )}

                <TouchableOpacity
                  onLongPress={() => isMyMessage && !isDeleted && handleDeleteMessage(item.id)}
                  activeOpacity={0.8}
                >
                  {isMyMessage ? (
                    // Sent message — copper gradient
                    <YStack alignItems="flex-end" marginBottom={16}>
                      <YStack style={styles.sentBubbleOuter}>
                        <LinearGradient
                          colors={['#894d0d', '#a76526']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.sentBubble}
                        >
                          {isDeleted ? (
                            <Text color="rgba(255,255,255,0.6)" fontSize={15} fontStyle="italic">
                              Meddelandet har raderats
                            </Text>
                          ) : isImageType && item.mediaUrl ? (
                            <Image
                              source={{ uri: item.mediaUrl }}
                              style={{ width: 200, height: 200, borderRadius: 12 }}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text color="white" fontSize={15} lineHeight={22}>
                              {item.content || ''}
                            </Text>
                          )}
                        </LinearGradient>
                      </YStack>
                      {isLastSent && !isDeleted && (
                        <Text
                          fontSize={10}
                          color={`${WARM_GRAY}66`}
                          textTransform="uppercase"
                          letterSpacing={1.5}
                          marginTop={4}
                          marginRight={4}
                        >
                          Läst
                        </Text>
                      )}
                    </YStack>
                  ) : (
                    // Received message — beige bubble with avatar
                    <XStack gap={10} marginBottom={16} maxWidth="85%">
                      {item.sender.photoUrl ? (
                        <Image
                          source={{ uri: item.sender.photoUrl }}
                          style={styles.messageAvatar}
                        />
                      ) : (
                        <YStack style={[styles.messageAvatar, styles.messageAvatarFallback]}>
                          <Text fontSize={10} fontWeight="600" color={WARM_WHITE}>
                            {getInitials(item.sender.displayName || '?')}
                          </Text>
                        </YStack>
                      )}
                      <YStack style={styles.receivedBubble}>
                        {isDeleted ? (
                          <Text color={WARM_GRAY} fontSize={15} fontStyle="italic">
                            Meddelandet har raderats
                          </Text>
                        ) : isImageType && item.mediaUrl ? (
                          <Image
                            source={{ uri: item.mediaUrl }}
                            style={{ width: 200, height: 200, borderRadius: 12 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text color={CHARCOAL} fontSize={15} lineHeight={22}>
                            {item.content || ''}
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  )}
                </TouchableOpacity>
              </>
            )
          }}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <YStack flex={1} alignItems="center" justifyContent="center" padding={32}>
              <Text color={WARM_GRAY} fontSize={15} textAlign="center">
                Inga meddelanden ännu.{'\n'}Börja konversationen!
              </Text>
            </YStack>
          }
        />

        {/* Typing indicator */}
        {isTyping && (
          <YStack paddingHorizontal={24} paddingVertical={6}>
            <Text fontSize={13} color={WARM_GRAY} fontStyle="italic">
              {displayName} skriver...
            </Text>
          </YStack>
        )}

        {/* Input bar */}
        <YStack
          paddingHorizontal={20}
          paddingVertical={12}
          paddingBottom={Platform.OS === 'ios' ? 32 : 12}
          backgroundColor={`${WARM_WHITE}F2`}
        >
          <XStack
            alignItems="center"
            gap={10}
            backgroundColor="#f8f3ee"
            paddingHorizontal={16}
            paddingVertical={8}
            borderRadius={24}
          >
            <TouchableOpacity style={{ opacity: 0.5 }}>
              <Text fontSize={22}>📷</Text>
            </TouchableOpacity>

            <Input
              flex={1}
              placeholder="Skriv ett meddelande..."
              placeholderTextColor={`${WARM_GRAY}66`}
              value={inputText}
              onChangeText={handleInputChange}
              fontSize={15}
              borderWidth={0}
              backgroundColor="transparent"
              paddingVertical={8}
              maxHeight={100}
              editable={!sendingMessage}
              multiline
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || sendingMessage}
              style={[
                styles.sendButton,
                (!inputText.trim() || sendingMessage) && { opacity: 0.4 },
              ]}
            >
              {sendingMessage ? (
                <Spinner size="small" color={COPPER} />
              ) : (
                <Text fontSize={18} color={COPPER} fontWeight="700">→</Text>
              )}
            </TouchableOpacity>
          </XStack>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  photoStrip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  photoThumb: {
    width: 56,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216, 195, 180, 0.20)',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7A9E7E',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  messageList: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sentBubbleOuter: {
    maxWidth: '85%',
  },
  sentBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#f8f3ee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 4,
  },
  messageAvatarFallback: {
    backgroundColor: COPPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
