# Epic: wave-3c-screenshot-ephemeral
**Model:** haiku
**Wave:** 3 — Group B (after Group A: 3a + 3b)

## Goal
Add screenshot blocking (Android FLAG_SECURE / iOS detection) using `expo-screen-capture`, and ephemeral message mode (timer-based auto-delete).

## Context

### Stack
- Mobile only for screenshot blocking
- `expo-screen-capture` — native module for screenshot prevention
- `apps/mobile/app/(tabs)/chat/[conversationId].tsx` — the chat room route (created in 3a)
- Prisma `Message` model already has `deletedAt DateTime?` field

### Dependency
Add `expo-screen-capture` to `apps/mobile/package.json`:
```json
"expo-screen-capture": "~7.1.0"
```

### tRPC: add ephemeral support
Need a new mutation in conversation-router.ts: `deleteMessage` for ephemeral cleanup.

## Acceptance Criteria

1. `apps/mobile/app/(tabs)/chat/[conversationId].tsx` — import and use `expo-screen-capture`:
   ```typescript
   import * as ScreenCapture from 'expo-screen-capture'
   // In useEffect on mount:
   ScreenCapture.preventScreenCaptureAsync()
   // On unmount:
   return () => { ScreenCapture.allowScreenCaptureAsync() }
   ```
   This prevents screenshots AND screen recording on Android (FLAG_SECURE). On iOS it blurs the screen when recording starts.

2. `packages/app/src/hooks/useChatRoom.ts` — add iOS screenshot detection:
   - Use `ScreenCapture.addScreenshotListener` to detect when a screenshot is taken
   - When screenshot detected: push `"screenshot_taken"` event to Phoenix channel (notify other user)
   - The other user's client shows a toast: "The other person took a screenshot"

3. `services/realtime/lib/realtime_web/channels/conversation_channel.ex` — handle `"screenshot_taken"` event:
   - Broadcast `"screenshot_taken"` to all OTHER participants in the channel (using `broadcast_from!`)
   - Payload: `%{ "user_id" => user_id, "at" => ISO8601 timestamp }`

4. `packages/app/src/screens/ChatRoomScreen.tsx` — listen for `"screenshot_taken"` channel event:
   - Show a toast/banner notification: "📸 Screenshot taken" for 3 seconds when received

5. `services/api/src/trpc/conversation-router.ts` — add `deleteMessage` mutation:
   - input: `{ messageId: z.string().uuid() }`
   - Verify caller is the `senderId` of the message (FORBIDDEN otherwise)
   - Set `deletedAt = new Date()` (soft delete)
   - Returns `{ success: true }`

6. `packages/app/src/screens/ChatRoomScreen.tsx` — add ephemeral mode UI:
   - Long-press on a message you sent → show "Delete" option
   - Calls `deleteMessage` mutation
   - Messages with `deletedAt != null` show as "This message was deleted" in gray

7. `apps/mobile/package.json` — add `"expo-screen-capture": "~7.1.0"`

## Files to Edit
- `apps/mobile/app/(tabs)/chat/[conversationId].tsx`
- `apps/mobile/package.json`
- `packages/app/src/hooks/useChatRoom.ts`
- `packages/app/src/screens/ChatRoomScreen.tsx`
- `services/realtime/lib/realtime_web/channels/conversation_channel.ex`
- `services/api/src/trpc/conversation-router.ts`
