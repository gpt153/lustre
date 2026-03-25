# Epic: wave-3a-chat-screens-mobile
**Model:** haiku
**Wave:** 3 — Group A (parallel)

## Goal
Build the full chat UI for mobile: conversation list screen, chat screen with message bubbles, real-time WebSocket updates, media viewer, typing indicator, and unread badge on the chat tab.

## Context

### Stack
- Mobile: Expo Router, React Native, Tamagui (`YStack`, `XStack`, `Text`, `Spinner`, `Button`, `Image`, `ScrollView`, `Input` from `tamagui`)
- Shared components pattern: screens go in `packages/app/src/screens/`, hooks in `packages/app/src/hooks/`
- The mobile tab at `apps/mobile/app/(tabs)/chat.tsx` currently shows "Coming Soon" — replace with real implementation
- tRPC client: `import { trpc } from '@lustre/api'`
- Auth: `import { useAuthStore } from '../stores/authStore'` — provides `accessToken`, `userId`

### Existing patterns (read before implementing)
- `packages/app/src/screens/FeedScreen.tsx` — FlatList + useFeed hook pattern
- `packages/app/src/hooks/useDiscovery.ts` — hook using trpc queries + mutations
- `apps/mobile/app/(tabs)/discover.tsx` — mobile tab using shared screen

### Phoenix WebSocket
- URL: `wss://ws.lovelustre.com/socket` (use env var `EXPO_PUBLIC_WS_URL` or hardcode)
- Connect with: `new PhoenixSocket(wsUrl, { params: { token: accessToken } })`
- Use `phoenix` npm package: add `phoenix` to `packages/app/package.json` dependencies
- Channel: `socket.channel("conversation:<id>", {})`
- Events: listen for `"new_message"`, `"user_typing"`

### tRPC procedures available
- `trpc.conversation.list.useQuery()` — returns conversations list
- `trpc.conversation.getMessages.useQuery({ conversationId, limit })` — paginated messages
- `trpc.conversation.markRead.useMutation()` — mark conversation as read
- `trpc.conversation.updateMessageStatus.useMutation()` — update status

### Conversation list response shape
```typescript
{
  id: string,
  matchId: string,
  createdAt: Date,
  otherParticipant: { userId: string, displayName: string | null, photoUrl: string | null } | null,
  lastMessage: { id: string, content: string | null, type: string, createdAt: Date, senderId: string } | null,
  unreadCount: number
}[]
```

### Message response shape
```typescript
{
  id: string, content: string | null, type: string, status: string,
  mediaUrl: string | null, deletedAt: Date | null, createdAt: Date,
  sender: { id: string, displayName: string | null, photoUrl: string | null }
}
```

## Acceptance Criteria

1. `packages/app/src/hooks/useChat.ts` — hook for conversation list:
   - `useChat()` — returns `{ conversations, isLoading, refetch }`
   - Queries `trpc.conversation.list`

2. `packages/app/src/hooks/useChatRoom.ts` — hook for single conversation:
   - `useChatRoom(conversationId: string)` — returns `{ messages, isLoading, sendMessage, sendingMessage }`
   - Queries `trpc.conversation.getMessages` initially
   - Opens Phoenix channel `"conversation:<conversationId>"` and appends incoming `"new_message"` events to messages
   - `sendMessage(content: string)` pushes `"send_message"` to channel
   - On mount: calls `markRead` mutation
   - `typing` state: pushes `"typing_start"` / `"typing_stop"` with debounce

3. `packages/app/src/screens/ConversationListScreen.tsx` — conversation list:
   - FlatList of conversations
   - Each row: avatar (photoUrl or initials fallback), displayName, lastMessage preview, createdAt timestamp, unread badge (red circle with count if > 0)
   - Tapping navigates to chat room (passes conversationId + displayName)

4. `packages/app/src/screens/ChatRoomScreen.tsx` — chat room:
   - Header: back button + other user's displayName + online indicator (green dot if online, from Phoenix Presence)
   - FlatList (inverted) of message bubbles:
     - My messages: right-aligned, primary color background
     - Their messages: left-aligned, card background
     - IMAGE type: shows Image component with the mediaUrl (or blurred overlay if isFiltered == true, with "Tap to reveal" button)
     - Timestamp below each bubble
   - Input bar at bottom: TextInput + send button
   - Typing indicator: show "... typing" text when receiving `"user_typing"` with `typing: true`
   - Auto-scrolls to bottom on new message

5. `apps/mobile/app/(tabs)/chat.tsx` — replace "Coming Soon" with `<ConversationListScreen />`
   - Add a dynamic route: `apps/mobile/app/(tabs)/chat/[conversationId].tsx` for the chat room

6. `apps/mobile/app/(tabs)/_layout.tsx` — ensure chat tab has `unreadBadge` from total unread count (read this file first)

7. `packages/app/package.json` — add `"phoenix": "^1.7.0"` to dependencies

## Files to Edit
- `apps/mobile/app/(tabs)/chat.tsx`
- `apps/mobile/app/(tabs)/_layout.tsx`
- `packages/app/package.json`

## Files to Create
- `packages/app/src/hooks/useChat.ts`
- `packages/app/src/hooks/useChatRoom.ts`
- `packages/app/src/screens/ConversationListScreen.tsx`
- `packages/app/src/screens/ChatRoomScreen.tsx`
- `apps/mobile/app/(tabs)/chat/[conversationId].tsx`
- `apps/mobile/app/(tabs)/chat/index.tsx` (if needed for nested routing)
