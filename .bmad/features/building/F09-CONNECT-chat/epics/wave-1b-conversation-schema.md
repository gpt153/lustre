# Epic: wave-1b-conversation-schema
**Model:** haiku
**Wave:** 1

## Goal
Add Conversation, Message, and ConversationParticipant Prisma models to the existing schema, generate and apply a migration, and update the match router to auto-create a Conversation + participants when a mutual match occurs.

## Context

### Existing schema (relevant parts)
- `services/api/prisma/schema.prisma` — already has User, Match, Profile models
- Match model: `{ id, user1Id, user2Id, createdAt }` — created when both users LIKE each other
- `services/api/src/trpc/match-router.ts` — `swipe` mutation at line 202 creates Match: `await ctx.prisma.match.create({ data: { user1Id, user2Id } })`
- `services/api/src/trpc/router.ts` — imports `matchRouter` as `match`

### Import patterns
```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
// Prisma accessed via ctx.prisma
```

### New Prisma models to add
```prisma
enum MessageType {
  TEXT
  IMAGE
  VIDEO
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
}

model Conversation {
  id           String                    @id @default(uuid()) @db.Uuid
  matchId      String                    @unique @map("match_id") @db.Uuid
  createdAt    DateTime                  @default(now()) @map("created_at")
  match        Match                     @relation(fields: [matchId], references: [id], onDelete: Cascade)
  participants ConversationParticipant[]
  messages     Message[]

  @@map("conversations")
}

model ConversationParticipant {
  id             String       @id @default(uuid()) @db.Uuid
  conversationId String       @map("conversation_id") @db.Uuid
  userId         String       @map("user_id") @db.Uuid
  joinedAt       DateTime     @default(now()) @map("joined_at")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
  @@map("conversation_participants")
}

model Message {
  id             String         @id @default(uuid()) @db.Uuid
  conversationId String         @map("conversation_id") @db.Uuid
  senderId       String         @map("sender_id") @db.Uuid
  content        String?
  type           MessageType    @default(TEXT)
  status         MessageStatus  @default(SENT)
  mediaUrl       String?        @map("media_url")
  deletedAt      DateTime?      @map("deleted_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  conversation   Conversation   @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User           @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@map("messages")
}
```

Also add to Match model:
```prisma
conversation   Conversation?
```

Also add to User model:
```prisma
conversationParticipants ConversationParticipant[]
messagesSent             Message[]
```

## Acceptance Criteria

1. `services/api/prisma/schema.prisma` has `MessageType`, `MessageStatus` enums and `Conversation`, `ConversationParticipant`, `Message` models exactly as specified above
2. `Match` model has `conversation Conversation?` back-relation
3. `User` model has `conversationParticipants` and `messagesSent` back-relations
4. A migration file exists at `services/api/prisma/migrations/<timestamp>_add_chat_schema/migration.sql` with correct CREATE TABLE statements for `conversations`, `conversation_participants`, `messages`
5. `services/api/src/trpc/match-router.ts` — after `ctx.prisma.match.create(...)` succeeds, create Conversation + two ConversationParticipant records (user1Id, user2Id) in a Prisma transaction
6. The `swipe` mutation returns `{ matched: true, matchId: match.id, conversationId: conversation.id }` when a match occurs
7. A tRPC `conversation` router exists at `services/api/src/trpc/conversation-router.ts` with: `list` (get user's conversations with last message + unread count), `getMessages` (cursor-based pagination, 50/page, oldest-first)
8. `services/api/src/trpc/router.ts` imports and mounts `conversationRouter` as `conversation`

## Files to Edit
- `services/api/prisma/schema.prisma` — add enums + models + back-relations

## Files to Create
- `services/api/prisma/migrations/<timestamp>_add_chat_schema/migration.sql`
- `services/api/src/trpc/conversation-router.ts`

## Files to Edit
- `services/api/src/trpc/match-router.ts` — auto-create conversation on match
- `services/api/src/trpc/router.ts` — mount conversation router
