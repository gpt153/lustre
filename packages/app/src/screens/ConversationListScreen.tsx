import { useCallback, useMemo, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native'
import { YStack, XStack, Text, Spinner, ScrollView } from 'tamagui'
import { useRouter } from 'expo-router'
import { useChat } from '../hooks/useChat'
import { EmptyState } from '../components/EmptyState'
import { PolaroidAvatar } from '@lustre/ui'

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

  if (diffMins < 1) return 'Nu'
  if (diffMins < 60) return `${diffMins}m sedan`
  if (diffHours < 24) return `${diffHours}h sedan`
  if (diffDays < 7) return `${diffDays}d sedan`

  return messageDate.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })
}

// Colors from Lustre design tokens
const COPPER = '#894d0d'
const COPPER_ACCENT = '#B87333'
const COPPER_LIGHT = '#D4A574'
const GOLD = '#D4A843'
const WARM_WHITE = '#fef8f3'
const WARM_CREAM = '#F5EDE4'
const CHARCOAL = '#2C2421'
const WARM_GRAY = '#8B7E74'
const SAGE = '#7A9E7E'
const SURFACE_CONTAINER_LOW = '#fff1ec'
const SURFACE_CONTAINER_LOWEST = '#ffffff'
const SURFACE_CONTAINER_HIGH = '#f8f3ee'
const OUTLINE_VARIANT = '#d8c3b4'
const ON_SURFACE_VARIANT = '#524439'
const OUTLINE = '#9C8B7E'

// Rotation pattern per row index (cycling)
const ROW_ROTATIONS = [-2, 3, -1, 2, -3]
// Match card rotations
const MATCH_ROTATIONS = [2, -3, 1, -2, 3, -1]

export function ConversationListScreen() {
  const router = useRouter()
  const { conversations, isLoading, refetch } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const handleConversationPress = useCallback(
    (conversationId: string, displayName: string | null | undefined) => {
      router.push({
        pathname: '/chat/[conversationId]',
        params: {
          conversationId,
          displayName: displayName || 'Okänd',
        },
      })
    },
    [router]
  )

  const conversationList = useMemo(() => conversations, [conversations])

  const totalUnread = useMemo(
    () => conversationList?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) ?? 0,
    [conversationList]
  )

  // Filter for "new matches" — recent conversations with no messages yet
  const newMatches = useMemo(
    () =>
      conversationList?.filter(
        (c) => !c.lastMessage?.content
      ) ?? [],
    [conversationList]
  )

  // Count unread conversations for section label
  const unreadCount = useMemo(
    () => conversationList?.filter((c) => c.unreadCount > 0).length ?? 0,
    [conversationList]
  )

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversationList
    const query = searchQuery.toLowerCase()
    return conversationList?.filter(
      (c) =>
        c.otherParticipant?.displayName?.toLowerCase().includes(query) ||
        c.lastMessage?.content?.toLowerCase().includes(query)
    )
  }, [conversationList, searchQuery])

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={WARM_WHITE}>
        <Spinner color={COPPER} />
      </YStack>
    )
  }

  const renderHeader = () => (
    <YStack paddingHorizontal={24} paddingTop={16} paddingBottom={8} backgroundColor={WARM_WHITE}>
      {/* Title + Unread Badge */}
      <XStack alignItems="center" gap={12} marginBottom={24}>
        <Text
          fontSize={34}
          fontWeight="bold"
          color={COPPER}
          fontFamily="$heading"
        >
          Meddelanden
        </Text>
        {totalUnread > 0 && (
          <YStack
            backgroundColor={COPPER}
            paddingHorizontal={10}
            paddingVertical={4}
            borderRadius={999}
            elevation={1}
          >
            <Text fontSize={12} fontWeight="bold" color="white">
              {totalUnread}
            </Text>
          </YStack>
        )}
      </XStack>

      {/* Search Bar — rounded-full with surface-container-high bg */}
      <YStack marginBottom={28}>
        <XStack alignItems="center" position="relative">
          <Text
            position="absolute"
            left={20}
            fontSize={16}
            color={WARM_GRAY}
            zIndex={1}
            pointerEvents="none"
          >
            🔍
          </Text>
          <TextInput
            style={[
              styles.searchInput,
              searchFocused && styles.searchInputFocused,
            ]}
            placeholder="Sök bland dina kontakter..."
            placeholderTextColor={WARM_GRAY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </XStack>
      </YStack>

      {/* Nya matchningar — with PolaroidAvatar */}
      {newMatches.length > 0 && (
        <YStack marginBottom={28}>
          <Text
            fontSize={20}
            fontWeight="bold"
            color={CHARCOAL}
            fontFamily="$heading"
            marginBottom={16}
            paddingHorizontal={2}
          >
            Nya matchningar
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 20, paddingBottom: 8 }}
          >
            {newMatches.map((match, index) => {
              const rotation = MATCH_ROTATIONS[index % MATCH_ROTATIONS.length]
              const showStack = index < 2
              const photoUrl = match.otherParticipant?.photoUrl
              const displayName = match.otherParticipant?.displayName
              const firstName = displayName?.split(' ')[0] || 'Okänd'

              return (
                <TouchableOpacity
                  key={match.id}
                  onPress={() =>
                    handleConversationPress(
                      match.id,
                      displayName
                    )
                  }
                  activeOpacity={0.7}
                >
                  <YStack alignItems="center" gap={6}>
                    <PolaroidAvatar
                      imageUrl={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=894d0d&color=fff&size=128`}
                      name={firstName}
                      size={48}
                      rotation={rotation}
                      showStack={showStack}
                    />
                  </YStack>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </YStack>
      )}

      {/* Section label — "Recent Archives" style with handwriting note count */}
      <XStack
        alignItems="baseline"
        justifyContent="space-between"
        paddingHorizontal={2}
        marginBottom={12}
      >
        <Text
          fontSize={18}
          fontWeight="bold"
          color={COPPER}
          fontFamily="$heading"
        >
          Senaste konversationer
        </Text>
        {unreadCount > 0 && (
          <Text
            fontSize={13}
            color={COPPER_LIGHT}
            fontFamily="$body"
            fontStyle="italic"
          >
            {unreadCount} nya meddelanden
          </Text>
        )}
      </XStack>
    </YStack>
  )

  return (
    <YStack flex={1} backgroundColor={WARM_WHITE}>
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item, index }) => {
          const isUnread = item.unreadCount > 0
          const rotation = ROW_ROTATIONS[index % ROW_ROTATIONS.length]
          const showStack = index < 2
          const photoUrl = item.otherParticipant?.photoUrl
          const displayName = item.otherParticipant?.displayName
          const firstName = displayName?.split(' ')[0] || 'Okänd'

          return (
            <TouchableOpacity
              onPress={() =>
                handleConversationPress(
                  item.id,
                  displayName
                )
              }
              activeOpacity={0.7}
            >
              <XStack
                alignItems="center"
                gap={16}
                padding={16}
                backgroundColor={isUnread ? SURFACE_CONTAINER_LOW : SURFACE_CONTAINER_LOWEST}
                borderRadius={16}
              >
                {/* Polaroid Avatar */}
                <YStack position="relative" flexShrink={0}>
                  <PolaroidAvatar
                    imageUrl={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=894d0d&color=fff&size=128`}
                    name={firstName}
                    size={64}
                    rotation={rotation}
                    showStack={showStack}
                  />

                  {/* Unread indicator — copper dot with glow */}
                  {isUnread && (
                    <YStack
                      position="absolute"
                      top={-3}
                      right={-3}
                      width={14}
                      height={14}
                      backgroundColor={COPPER_ACCENT}
                      borderRadius={999}
                      borderWidth={2}
                      borderColor="#FFFFFF"
                      zIndex={10}
                      {...Platform.select({
                        ios: {
                          shadowColor: COPPER_ACCENT,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 6,
                        },
                        android: {
                          elevation: 4,
                        },
                      })}
                    />
                  )}
                </YStack>

                {/* Content */}
                <YStack flex={1} minWidth={0}>
                  <XStack justifyContent="space-between" alignItems="baseline" marginBottom={4}>
                    <Text
                      fontSize={17}
                      fontWeight="bold"
                      color={CHARCOAL}
                      numberOfLines={1}
                      flex={1}
                      opacity={isUnread ? 1 : 0.8}
                    >
                      {displayName || 'Okänd'}
                    </Text>
                    {/* Timestamp — unread: copper uppercase, read: muted */}
                    <Text
                      fontSize={10}
                      fontWeight={isUnread ? '600' : '500'}
                      color={isUnread ? COPPER : OUTLINE}
                      textTransform={isUnread ? 'uppercase' : 'none'}
                      letterSpacing={isUnread ? -0.3 : 0}
                      marginLeft={8}
                    >
                      {formatTime(item.createdAt)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between" alignItems="center">
                    <Text
                      fontSize={14}
                      color={isUnread ? CHARCOAL : WARM_GRAY}
                      fontWeight={isUnread ? '600' : '400'}
                      numberOfLines={1}
                      flex={1}
                    >
                      {item.lastMessage?.content || 'Inget meddelande ännu'}
                    </Text>

                    {/* Unread dot — copper with glow shadow */}
                    {isUnread && (
                      <YStack
                        width={10}
                        height={10}
                        backgroundColor={COPPER_ACCENT}
                        borderRadius={999}
                        marginLeft={16}
                        flexShrink={0}
                        {...Platform.select({
                          ios: {
                            shadowColor: COPPER_ACCENT,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 4,
                          },
                          android: {
                            elevation: 2,
                          },
                        })}
                      />
                    )}
                  </XStack>
                </YStack>
              </XStack>
            </TouchableOpacity>
          )
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => refetch()}
            tintColor={COPPER}
            colors={[COPPER]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Inga konversationer ännu"
            description="Matcha med någon för att starta en konversation. Ditt första meddelande väntar."
            action={{ label: 'Hitta matchningar', onPress: () => router.push('/discover') }}
          />
        }
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 100 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          // Navigate to new chat or discover
        }}
      >
        <Text fontSize={28} color="white" fontWeight="300">
          +
        </Text>
      </TouchableOpacity>
    </YStack>
  )
}

const styles = StyleSheet.create({
  searchInput: {
    width: '100%',
    backgroundColor: SURFACE_CONTAINER_HIGH,
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 48,
    fontSize: 15,
    fontWeight: '500',
    color: CHARCOAL,
    borderWidth: 0,
  },
  searchInputFocused: {
    backgroundColor: '#ece7e2',
    shadowColor: '#894d0d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    backgroundColor: '#894d0d',
  },
})
