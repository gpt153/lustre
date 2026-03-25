# Epic: wave-2c-typing-receipts
**Model:** haiku
**Wave:** 2 — Group A (parallel)

## Goal
Implement typing indicators (broadcast via Phoenix Channel) and read receipt tracking (per-user opt-in setting stored in DB, updated via tRPC).

## Context

### Existing code
- `services/realtime/lib/realtime_web/channels/conversation_channel.ex` — channel for `conversation:*`
- `services/api/prisma/schema.prisma` — has `ConversationParticipant` model
- `services/api/src/trpc/conversation-router.ts` — existing conversation procedures
- `User` model has userId as UUID
- Prisma pattern: `@@map("snake_case")`, `@map("snake_case")` for fields

### Architecture
- Typing indicators: pure Phoenix Channel events (no DB persistence needed)
- Read receipts: store `lastReadAt DateTime?` on `ConversationParticipant`
- Read receipts setting: store per-user in a new `ChatSettings` model or add fields to `ConversationParticipant`

## Acceptance Criteria

1. `services/realtime/lib/realtime_web/channels/conversation_channel.ex` — handle `"typing_start"` and `"typing_stop"` events from client:
   - `"typing_start"`: broadcast `"user_typing"` to channel with `%{ "user_id" => current_user_id, "typing" => true }` — to all OTHER participants (use `broadcast_from!`)
   - `"typing_stop"`: broadcast `"user_typing"` with `%{ "user_id" => current_user_id, "typing" => false }` to all OTHER participants

2. `services/api/prisma/schema.prisma` — add to `ConversationParticipant` model:
   - `lastReadAt  DateTime? @map("last_read_at")`
   - `readReceipts Boolean  @default(true) @map("read_receipts")`

3. `services/api/prisma/migrations/20260325000200_add_read_receipts/migration.sql` — migration:
   - `ALTER TABLE conversation_participants ADD COLUMN last_read_at TIMESTAMPTZ;`
   - `ALTER TABLE conversation_participants ADD COLUMN read_receipts BOOLEAN NOT NULL DEFAULT TRUE;`

4. `services/api/src/trpc/conversation-router.ts` — add two mutations:
   - `markRead`: input `{ conversationId: z.string().uuid() }` — sets `lastReadAt = now()` on participant record if `readReceipts == true`; also updates `Message.status` to READ for all messages in conversation sent by other user where `status != READ`
   - `toggleReadReceipts`: input `{ conversationId: z.string().uuid(), enabled: z.boolean() }` — sets `readReceipts = enabled` on participant record

5. `services/api/src/trpc/conversation-router.ts` — update `list` procedure to return correct `unreadCount`:
   - Count messages where `createdAt > participant.lastReadAt` and `senderId != ctx.userId`
   - (Currently returns hardcoded 0 — fix this)

## Files to Edit
- `services/realtime/lib/realtime_web/channels/conversation_channel.ex`
- `services/api/prisma/schema.prisma`
- `services/api/src/trpc/conversation-router.ts`

## Files to Create
- `services/api/prisma/migrations/20260325000200_add_read_receipts/migration.sql`
