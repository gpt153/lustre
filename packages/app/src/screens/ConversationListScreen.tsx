import { useCallback, useMemo } from 'react'
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import { YStack, XStack, Text, Spinner, Image, Circle } from 'tamagui'
import { useRouter } from 'expo-router'
import { useChat } from '../hooks/useChat'

function getInitials(displayName: string | null | undefined): string {
  if (!displayName) return '?'
  const parts = displayName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return displayName.charAt(0).toUpperCase()
}

function formatTime(date: Date): string {
  const now = new Date()
  const messageDate = new Date(date)
  const diffMs = now.getTime() - messageDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ConversationListScreen() {
  const router = useRouter()
  const { conversations, isLoading, refetch } = useChat()

  const handleConversationPress = useCallback(
    (conversationId: string, displayName: string | null | undefined) => {
      router.push({
        pathname: '/chat/[conversationId]',
        params: {
          conversationId,
          displayName: displayName || 'Unknown',
        },
      })
    },
    [router]
  )

  const conversationList = useMemo(() => conversations, [conversations])

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <FlatList
      data={conversationList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handleConversationPress(item.id, item.otherParticipant?.displayName)}
          activeOpacity={0.7}
        >
          <YStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderBottomColor="$borderColor"
            borderBottomWidth={1}
          >
            <XStack alignItems="center" space="$3" flex={1}>
              {/* Avatar */}
              {item.otherParticipant?.photoUrl ? (
                <Image
                  source={{ uri: item.otherParticipant.photoUrl }}
                  width={48}
                  height={48}
                  borderRadius="$3"
                />
              ) : (
                <YStack
                  width={48}
                  height={48}
                  backgroundColor="$primary"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="$3"
                >
                  <Text color="white" fontWeight="bold" fontSize={14}>
                    {getInitials(item.otherParticipant?.displayName)}
                  </Text>
                </YStack>
              )}

              {/* Message content */}
              <YStack flex={1}>
                <XStack alignItems="center" justifyContent="space-between" space="$2">
                  <Text
                    fontSize={16}
                    fontWeight="600"
                    color="$text"
                    numberOfLines={1}
                    flex={1}
                  >
                    {item.otherParticipant?.displayName || 'Unknown User'}
                  </Text>
                  <Text fontSize={12} color="$textSecondary">
                    {formatTime(item.createdAt)}
                  </Text>
                </XStack>

                <XStack alignItems="center" justifyContent="space-between" marginTop="$1" space="$2">
                  <Text
                    fontSize={14}
                    color="$textSecondary"
                    numberOfLines={1}
                    flex={1}
                  >
                    {item.lastMessage?.content || 'No messages yet'}
                  </Text>

                  {/* Unread badge */}
                  {item.unreadCount > 0 && (
                    <Circle
                      size={24}
                      backgroundColor="$primary"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={12} fontWeight="bold" color="white">
                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                      </Text>
                    </Circle>
                  )}
                </XStack>
              </YStack>
            </XStack>
          </YStack>
        </TouchableOpacity>
      )}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => refetch()}
          tintColor="#B87333"
          colors={['#B87333']}
        />
      }
      ListEmptyComponent={
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
          <Text color="$textSecondary" fontSize={16}>
            No conversations yet
          </Text>
          <Text color="$textSecondary" fontSize={14} marginTop="$2">
            Start matching to begin chatting
          </Text>
        </YStack>
      }
    />
  )
}
