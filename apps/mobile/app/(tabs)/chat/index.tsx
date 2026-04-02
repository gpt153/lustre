import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { Pencil } from 'phosphor-react-native'
import { PolaroidHeader } from '@/components/PolaroidHeader'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockMatches = [
  { id: '1', name: 'Emma', photo: 'https://picsum.photos/112/112', isNew: true },
  { id: '2', name: 'Viktor', photo: 'https://picsum.photos/113/113', isNew: true },
  { id: '3', name: 'Saga', photo: 'https://picsum.photos/114/114', isNew: true },
  { id: '4', name: 'Nils', photo: 'https://picsum.photos/115/115', isNew: false },
  { id: '5', name: 'Astrid', photo: 'https://picsum.photos/116/116', isNew: false },
  { id: '6', name: 'Linnea', photo: 'https://picsum.photos/117/117', isNew: false },
]

const mockConversations = [
  { id: '1', name: 'Emma', photo: 'https://picsum.photos/96/96', lastMessage: 'Ses vi kl 19? 🍷', timestamp: '14:20', unread: 3, isTyping: false, isOnline: false, hasMedia: false },
  { id: '2', name: 'Viktor', photo: 'https://picsum.photos/97/97', lastMessage: 'Du: Låter bra! 👍', timestamp: '10:15', unread: 0, isTyping: false, isOnline: false, hasMedia: false },
  { id: '3', name: 'Saga', photo: 'https://picsum.photos/98/98', lastMessage: '', timestamp: 'Nu', unread: 0, isTyping: true, isOnline: false, hasMedia: false },
  { id: '4', name: 'Nils', photo: 'https://picsum.photos/99/99', lastMessage: 'Bild', timestamp: 'Igår', unread: 0, isTyping: false, isOnline: false, hasMedia: true },
  { id: '5', name: 'Astrid', photo: 'https://picsum.photos/100/100', lastMessage: 'Tack för senast!', timestamp: 'Igår', unread: 0, isTyping: false, isOnline: false, hasMedia: false },
  { id: '6', name: 'Lukas', photo: 'https://picsum.photos/101/101', lastMessage: 'Låter som en plan', timestamp: 'Lör', unread: 0, isTyping: false, isOnline: true, hasMedia: false },
  { id: '7', name: 'Freja', photo: 'https://picsum.photos/102/102', lastMessage: 'Vi hörs!', timestamp: 'Tis', unread: 0, isTyping: false, isOnline: false, hasMedia: false },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MatchAvatar({ item }: { item: typeof mockMatches[0] }) {
  return (
    <Pressable style={styles.matchItem}>
      <View style={styles.matchAvatarWrapper}>
        <Image source={{ uri: item.photo }} style={styles.matchAvatar} />
        {item.isNew && <View style={styles.newDot} />}
      </View>
      <Text style={styles.matchName} numberOfLines={1}>
        {item.name}
      </Text>
    </Pressable>
  )
}

function ConversationRow({ item }: { item: typeof mockConversations[0] }) {
  const isSentMessage = item.lastMessage.startsWith('Du:')

  return (
    <Pressable style={styles.conversationRow}>
      <View style={styles.conversationAvatarWrapper}>
        <Image source={{ uri: item.photo }} style={styles.conversationAvatar} />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationTopRow}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.conversationTimestamp}>{item.timestamp}</Text>
        </View>

        <View style={styles.conversationBottomRow}>
          {item.isTyping ? (
            <Text style={styles.typingText}>skriver...</Text>
          ) : item.hasMedia ? (
            <View style={styles.mediaRow}>
              <MaterialIcons name="photo-camera" size={16} color="#857467" />
              <Text style={[styles.conversationPreview, { marginLeft: 4 }]}>
                Bild
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.conversationPreview,
                isSentMessage && styles.sentPreview,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          )}

          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

const newMatchCount = mockMatches.filter((m) => m.isNew).length

export default function ChatTab() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <PolaroidHeader
        title="Chatt"
        rightIcon={Pencil}
        onRightPress={() => {}}
        rightAccessibilityLabel="Ny konversation"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 64,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Nya matchningar ---- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nya matchningar</Text>
          {newMatchCount > 0 && (
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{newMatchCount}</Text>
            </View>
          )}
        </View>

        <FlatList
          data={mockMatches}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.matchList}
          renderItem={({ item }) => <MatchAvatar item={item} />}
          scrollEnabled
        />

        {/* ---- Konversationer ---- */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Konversationer</Text>
        </View>

        {mockConversations.map((item, index) => (
          <View key={item.id}>
            <ConversationRow item={item} />
            {index < mockConversations.length - 1 && (
              <View style={styles.divider} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff8f6',
  },
  scrollView: {
    flex: 1,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#211a17',
  },
  sectionBadge: {
    marginLeft: 8,
    backgroundColor: '#894D0D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Match avatars horizontal list
  matchList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  matchItem: {
    alignItems: 'center',
    width: 64,
  },
  matchAvatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#894D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  newDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#894D0D',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  matchName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#211a17',
    textAlign: 'center',
  },

  // Conversation rows
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  conversationAvatarWrapper: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#211a17',
    flex: 1,
    marginRight: 8,
  },
  conversationTimestamp: {
    fontSize: 10,
    color: '#857467',
  },
  conversationBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationPreview: {
    fontSize: 13,
    color: '#524439',
    flex: 1,
    marginRight: 8,
  },
  sentPreview: {
    color: '#857467',
  },
  typingText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#894D0D',
    flex: 1,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#894D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(216, 195, 180, 0.30)',
    marginLeft: 84, // 24 padding + 48 avatar + 12 gap
    marginRight: 24,
  },
})
