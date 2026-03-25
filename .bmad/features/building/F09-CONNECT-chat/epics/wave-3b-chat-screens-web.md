# Epic: wave-3b-chat-screens-web
**Model:** haiku
**Wave:** 3 — Group A (parallel)

## Goal
Build the chat UI for web (Next.js): conversation list sidebar + chat panel layout, real-time WebSocket updates, media display, typing indicator.

## Context

### Stack
- Web: Next.js 16, Tamagui, `'use client'` directive for interactive components
- Pattern: `apps/web/app/(app)/chat/page.tsx` currently shows "Coming Soon"
- tRPC: `import { trpc } from '@lustre/api'`
- Auth: `import { useAuthStore } from '@lustre/app/stores/authStore'` — provides `accessToken`, `userId`
- Tamagui: `YStack`, `XStack`, `Text`, `Spinner`, `Button`, `Input`, `Image`, `ScrollView`

### Existing web patterns (read before implementing)
- `apps/web/app/(app)/discover/page.tsx` — desktop layout pattern
- `apps/web/app/(app)/groups/page.tsx` — list + detail pattern

### Phoenix WebSocket
- Same as mobile: `phoenix` npm package (already added to packages/app by 3a)
- Use `useChat` and `useChatRoom` hooks from `@lustre/app` (created in 3a)
- WebSocket URL from env: `process.env.NEXT_PUBLIC_WS_URL ?? 'wss://ws.lovelustre.com/socket'`

### Shared hooks (created in wave-3a)
- `useChat()` from `packages/app/src/hooks/useChat.ts`
- `useChatRoom(conversationId)` from `packages/app/src/hooks/useChatRoom.ts`
- `ConversationListScreen` from `packages/app/src/screens/ConversationListScreen.tsx`
- `ChatRoomScreen` from `packages/app/src/screens/ChatRoomScreen.tsx`

## Acceptance Criteria

1. `apps/web/app/(app)/chat/page.tsx` — 2-column layout:
   - Left sidebar (320px): list of conversations using `ConversationListScreen` (or inline if shared component doesn't adapt)
   - Right panel: active chat using `ChatRoomScreen` (or inline web version)
   - On mobile web: show either list OR chat (toggle)
   - Use `'use client'` directive
   - URL pattern: `/chat` shows list; `/chat/[conversationId]` shows that conversation selected

2. `apps/web/app/(app)/chat/[conversationId]/page.tsx` — conversation detail page:
   - Same 2-column layout with the selected conversation highlighted in sidebar
   - Chat panel shows messages for the selected conversationId
   - Pass `conversationId` param from URL to `useChatRoom`

3. The web chat UI should have:
   - Conversation list with avatar, name, last message preview, timestamp, unread badge
   - Chat panel: message bubbles (right = me, left = them), input + send button
   - Typing indicator when receiving `user_typing` events
   - Image messages rendered as `<img>` with blur for filtered content (isFiltered=true)
   - Responsive: on small screens, list and chat are separate pages

4. Web layout already has a nav link — ensure `/chat` is reachable from the nav
   Read `apps/web/app/(app)/layout.tsx` to see nav structure

## Files to Edit
- `apps/web/app/(app)/chat/page.tsx`
- `apps/web/app/(app)/layout.tsx` (add chat nav link if missing)

## Files to Create
- `apps/web/app/(app)/chat/[conversationId]/page.tsx`
