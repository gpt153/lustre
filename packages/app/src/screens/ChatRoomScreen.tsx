import { useCallback, useRef, useEffect, useState } from 'react'
import {
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  StyleSheet,
  View,
} from 'react-native'
import { YStack, XStack, Text, Input, Spinner } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { useChatRoom } from '../hooks/useChatRoom'
import { useAuthStore } from '../stores/authStore'
import { trpc } from '@lustre/api'
import { PolaroidCard } from '@lustre/ui'

const COPPER = '#894d0d'
const COPPER_LIGHT = '#a76526'
const WARM_WHITE = '#FDF8F3'
const CHARCOAL = '#2C2421'
const RECEIVED_BG = '#F5F1EE'
const WARM_GRAY = '#8B7E74'
const STONE_400 = '#a8a29e'
const ORANGE_900 = '#7c2d12'

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
  const avatarUrl = photos.length > 0 ? photos[0]?.url : undefined

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
      style={{ flex: 1, backgroundColor: WARM_WHITE }}
    >
      <YStack flex={1} backgroundColor={WARM_WHITE}>
        {/* Warm mesh gradient background */}
        <View style={styles.backgroundGradient}>
          <View style={styles.bgGradientTopLeft} />
          <View style={styles.bgGradientBottomRight} />
        </View>

        {/* Header — Stitch mobile-chat-room style */}
        <YStack
          paddingTop={Platform.OS === 'ios' ? 56 : 16}
          paddingHorizontal={16}
          paddingBottom={12}
          backgroundColor="rgba(253,248,243,0.9)"
        >
          <XStack alignItems="center" justifyContent="space-between">
            {/* Left: back chevron + mini Polaroid avatar */}
            <XStack alignItems="center" gap={12}>
              <TouchableOpacity
                onPress={onBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Tillbaka"
                accessibilityRole="button"
              >
                <Text fontSize={22} color={CHARCOAL}>{'‹'}</Text>
              </TouchableOpacity>

              {/* Mini Polaroid avatar */}
              <View style={styles.miniPolaroidContainer}>
                <View style={styles.miniPolaroid}>
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.miniPolaroidImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.miniPolaroidFallback}>
                      <Text fontSize={12} fontWeight="700" color={WARM_WHITE}>
                        {getInitials(displayName)}
                      </Text>
                    </View>
                  )}
                </View>
                {/* Online green dot */}
                <View style={styles.headerOnlineDot} />
              </View>

              {/* Name + Online label */}
              <YStack>
                <Text
                  fontSize={18}
                  fontWeight="700"
                  color={ORANGE_900}
                  fontFamily="$heading"
                  letterSpacing={-0.3}
                >
                  {displayName}
                </Text>
                <Text
                  fontSize={10}
                  fontWeight="500"
                  color={STONE_400}
                  textTransform="uppercase"
                  letterSpacing={1.5}
                >
                  Online
                </Text>
              </YStack>
            </XStack>

            {/* Right: more_vert icon */}
            <TouchableOpacity
              style={styles.moreButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Fler alternativ"
              accessibilityRole="button"
            >
              <Text fontSize={20} color={CHARCOAL}>{'⋮'}</Text>
            </TouchableOpacity>
          </XStack>
        </YStack>

        {/* Screenshot notification banner */}
        {screenshotBanner && (
          <YStack
            backgroundColor="#FFF3CD"
            paddingHorizontal={16}
            paddingVertical={8}
            alignItems="center"
          >
            <Text fontSize={13} fontWeight="600" color={CHARCOAL}>
              Skarmdump tagen
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
                      color={`${STONE_400}99`}
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
                    // Sent message — copper gradient, rounded-br-none
                    <YStack alignItems="flex-end" marginBottom={16}>
                      {isImageType && item.mediaUrl && !isDeleted ? (
                        // Inline Polaroid for image messages — outside bubble
                        <YStack alignItems="flex-end" maxWidth="85%">
                          <PolaroidCard
                            cardWidth={256}
                            imageSource={{ uri: item.mediaUrl }}
                            caption={item.content || ''}
                            rotation={1}
                          />
                        </YStack>
                      ) : (
                        <YStack style={styles.sentBubbleOuter}>
                          <LinearGradient
                            colors={[COPPER, COPPER_LIGHT]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sentBubble}
                          >
                            {isDeleted ? (
                              <Text color="rgba(255,255,255,0.6)" fontSize={15} fontStyle="italic">
                                Meddelandet har raderats
                              </Text>
                            ) : (
                              <Text color="white" fontSize={15} lineHeight={22}>
                                {item.content || ''}
                              </Text>
                            )}
                          </LinearGradient>
                        </YStack>
                      )}
                      {/* Read receipt — done_all style */}
                      {isLastSent && !isDeleted && (
                        <XStack alignItems="center" gap={2} marginTop={4} marginRight={4}>
                          <Text
                            fontSize={12}
                            color={COPPER}
                            fontWeight="600"
                          >
                            {'✓✓'}
                          </Text>
                          <Text
                            fontSize={10}
                            color={STONE_400}
                            letterSpacing={0.5}
                          >
                            Last
                          </Text>
                        </XStack>
                      )}
                    </YStack>
                  ) : (
                    // Received message — #F5F1EE bubble, rounded-bl-none
                    <XStack gap={10} marginBottom={16} maxWidth="85%">
                      {item.sender.photoUrl ? (
                        <Image
                          source={{ uri: item.sender.photoUrl }}
                          style={styles.messageAvatar}
                        />
                      ) : (
                        <View style={[styles.messageAvatar, styles.messageAvatarFallback]}>
                          <Text fontSize={10} fontWeight="600" color={WARM_WHITE}>
                            {getInitials(item.sender.displayName || '?')}
                          </Text>
                        </View>
                      )}
                      {isImageType && item.mediaUrl && !isDeleted ? (
                        // Inline Polaroid for received image
                        <YStack>
                          <PolaroidCard
                            cardWidth={256}
                            imageSource={{ uri: item.mediaUrl }}
                            caption={item.content || ''}
                            rotation={-1}
                          />
                          {/* Timestamp below Polaroid */}
                          <Text
                            fontSize={10}
                            color={STONE_400}
                            marginTop={4}
                          >
                            {new Date(item.createdAt).toLocaleTimeString('sv-SE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </YStack>
                      ) : (
                        <YStack>
                          <View style={styles.receivedBubble}>
                            {isDeleted ? (
                              <Text color={WARM_GRAY} fontSize={15} fontStyle="italic">
                                Meddelandet har raderats
                              </Text>
                            ) : (
                              <Text color={CHARCOAL} fontSize={15} lineHeight={22}>
                                {item.content || ''}
                              </Text>
                            )}
                          </View>
                          {/* Timestamp below bubble */}
                          <Text
                            fontSize={10}
                            color={STONE_400}
                            marginTop={4}
                          >
                            {new Date(item.createdAt).toLocaleTimeString('sv-SE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </YStack>
                      )}
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
                Inga meddelanden annu.{'\n'}Borja konversationen!
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

        {/* Input bar — glassmorphic */}
        <YStack
          paddingHorizontal={16}
          paddingVertical={10}
          paddingBottom={Platform.OS === 'ios' ? 32 : 10}
          backgroundColor="rgba(255,255,255,0.6)"
          style={styles.inputBarBlur}
        >
          <XStack alignItems="center" gap={10}>
            {/* Camera button */}
            <TouchableOpacity
              style={styles.cameraButton}
              accessibilityLabel="Ta foto"
              accessibilityRole="button"
            >
              <Text fontSize={20} color={COPPER}>{'📷'}</Text>
            </TouchableOpacity>

            {/* Input field — pill shape */}
            <XStack
              flex={1}
              alignItems="center"
              backgroundColor={RECEIVED_BG}
              borderRadius={9999}
              paddingHorizontal={20}
              paddingVertical={Platform.OS === 'ios' ? 6 : 2}
            >
              <Input
                flex={1}
                placeholder="Skriv ett meddelande..."
                placeholderTextColor={`${STONE_400}99`}
                value={inputText}
                onChangeText={handleInputChange}
                fontSize={15}
                borderWidth={0}
                backgroundColor="transparent"
                paddingVertical={8}
                maxHeight={100}
                editable={!sendingMessage}
                multiline
                accessibilityLabel="Meddelande"
              />
              {/* Heart emoji button */}
              <TouchableOpacity
                onPress={() => {
                  setInputText((prev) => prev + '❤️')
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Skicka hjarta"
              >
                <Text fontSize={18}>{'❤️'}</Text>
              </TouchableOpacity>
            </XStack>

            {/* Send button — 48px copper gradient circle */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || sendingMessage}
              style={[
                (!inputText.trim() || sendingMessage) && { opacity: 0.4 },
              ]}
              accessibilityLabel="Skicka meddelande"
              accessibilityRole="button"
            >
              {sendingMessage ? (
                <View style={styles.sendButton}>
                  <Spinner size="small" color="white" />
                </View>
              ) : (
                <LinearGradient
                  colors={[COPPER, COPPER_LIGHT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendButton}
                >
                  <Text fontSize={20} color="white" fontWeight="700">{'➤'}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </XStack>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  // Background warm mesh gradient layers
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FDF8F3',
  },
  bgGradientTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '50%',
    backgroundColor: 'rgba(255,241,236,0.5)',
    borderBottomRightRadius: 999,
  },
  bgGradientBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '50%',
    backgroundColor: 'rgba(254,206,101,0.1)',
    borderTopLeftRadius: 999,
  },

  // Header — mini Polaroid avatar
  miniPolaroidContainer: {
    position: 'relative',
  },
  miniPolaroid: {
    width: 36,
    height: 36,
    backgroundColor: '#f5f0eb',
    padding: 2,
    borderRadius: 2,
    transform: [{ rotate: '3deg' }],
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  miniPolaroidImage: {
    width: 32,
    height: 32,
    borderRadius: 1,
  },
  miniPolaroidFallback: {
    width: 32,
    height: 32,
    borderRadius: 1,
    backgroundColor: '#894d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#FDF8F3',
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
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
    borderBottomRightRadius: 4,
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  receivedBubble: {
    backgroundColor: '#F5F1EE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 4,
  },
  messageAvatarFallback: {
    backgroundColor: '#894d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input bar
  inputBarBlur: {
    // Glassmorphic backdrop — on iOS backdrop-filter works via BlurView
    // On Android we rely on the semi-transparent white bg
    borderTopWidth: 0,
  },
  cameraButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
})
