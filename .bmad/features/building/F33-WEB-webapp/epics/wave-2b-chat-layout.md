# Epic: Wave 2b — Chat Two-Column Layout

**Epic ID:** F33-W2b
**Wave:** 2 — Core Pages
**Size:** haiku
**Depends On:** Wave 1 (all)
**Status:** NOT STARTED

---

## Goal

Build the chat page with a persistent two-column layout: conversation list on the left, active chat on the right. Both are always visible — no click-back flows. Real-time messages via Phoenix WebSocket.

## Acceptance Criteria

1. Two-column chat layout: conversation list (300px fixed width, left) + active chat (remaining width, right); separated by 1px `var(--border-subtle)` divider
2. Conversation list shows avatar (40px circle), name, last message preview (truncated, 1 line), timestamp, unread badge (copper circle with white count); sorted by most recent message
3. Active chat area: messages displayed as bubbles — sent messages right-aligned (copper background `#B87333`, white text), received messages left-aligned (`var(--bg-secondary)`, `var(--text-primary)`); timestamp below each message group
4. Message input bar at bottom: full-width textarea (auto-grows up to 120px), `Enter` sends message, `Shift+Enter` inserts newline, send button (copper, disabled when empty)
5. Real-time messages via Phoenix WebSocket (packages/hooks/useChat): new messages appear instantly, typing indicator shows animated dots when other user is typing, read receipts shown as small checkmarks
6. Sound feedback: Web Audio API plays `message.mp3` on incoming message (if sounds enabled), `send.mp3` on sent message
7. At <900px: chat becomes single-column — conversation list is full width, tapping a conversation navigates to chat view with back button
8. Unread count displayed in browser tab title: `(3) Lustre` when there are unread messages across all conversations

## File Paths

- `apps/web/app/(app)/chat/page.tsx`
- `apps/web/components/chat/ChatLayout.tsx`
- `apps/web/components/chat/ChatLayout.module.css`
- `apps/web/components/chat/ConversationList.tsx`
- `apps/web/components/chat/ChatRoom.tsx`
- `apps/web/components/chat/MessageBubble.tsx`
- `apps/web/components/chat/MessageInput.tsx`

## Technical Notes

### Chat Layout CSS
```css
.chatLayout {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 64px); /* Full height minus header */
  overflow: hidden;
}
.conversationList {
  border-right: 1px solid var(--border-subtle);
  overflow-y: auto;
  background: var(--bg-secondary);
}
.chatRoom {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 900px) {
  .chatLayout {
    grid-template-columns: 1fr;
  }
  .conversationList.hidden {
    display: none;
  }
  .chatRoom.hidden {
    display: none;
  }
}
```

### Conversation Item CSS
```css
.conversationItem {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: background 100ms ease;
  border-bottom: 1px solid var(--border-subtle);
}
.conversationItem:hover {
  background: rgba(184, 115, 51, 0.06);
}
.conversationItemActive {
  background: rgba(184, 115, 51, 0.1);
  border-left: 3px solid var(--color-copper);
}
.unreadBadge {
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-copper);
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}
```

### Message Bubble CSS
```css
.bubble {
  max-width: 65%;
  padding: var(--space-3) var(--space-4);
  border-radius: 18px;
  font-size: 15px;
  line-height: 22px;
  word-wrap: break-word;
}
.bubbleSent {
  background: var(--color-copper);
  color: #FFFFFF;
  border-bottom-right-radius: 4px;
  align-self: flex-end;
}
.bubbleReceived {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
  align-self: flex-start;
}
```

### Message Input CSS
```css
.inputBar {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
}
.textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: 15px;
  max-height: 120px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  transition: border-color 200ms ease;
}
.textarea:focus {
  border-color: var(--color-copper);
  box-shadow: 0 0 0 3px rgba(184, 115, 51, 0.15);
}
.sendButton {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-copper);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 200ms ease, transform 100ms ease;
}
.sendButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sendButton:active {
  transform: scale(0.93);
}
```

### Typing Indicator
```css
.typingDots {
  display: flex;
  gap: 4px;
  padding: var(--space-2) var(--space-3);
}
.typingDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: dotPulse 1.4s ease-in-out infinite;
}
.typingDot:nth-child(2) { animation-delay: 0.2s; }
.typingDot:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
```

### RSC Strategy
- `page.tsx` — Server Component: fetches conversation list, renders `<ChatLayout />`
- `ChatLayout.tsx` — Client Component: manages selected conversation state
- `ConversationList.tsx` — Client Component: selection, unread badges
- `ChatRoom.tsx` — Client Component: WebSocket, messages, input
- `MessageBubble.tsx` — Client Component (minimal)

### Tab Title Update
```typescript
useEffect(() => {
  const total = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  document.title = total > 0 ? `(${total}) Lustre` : 'Lustre';
}, [conversations]);
```

## Definition of Done
- Two-column layout shows conversation list + active chat simultaneously
- Clicking conversation selects it and shows messages in chat room
- Messages send on Enter, newline on Shift+Enter
- Real-time messages appear via WebSocket
- Typing indicator shows when other user is typing
- Sound plays on incoming/sent messages (when enabled)
- Unread badge shows correct count
- Tab title shows unread count
- Mobile (<900px) shows single-column with navigation
