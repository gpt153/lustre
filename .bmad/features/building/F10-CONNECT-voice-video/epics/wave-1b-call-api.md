# Epic: wave-1b-call-api

**Wave:** 1 (depends on wave-1a)
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Add Prisma schema for call sessions and implement the tRPC `call` router with procedures: `initiate`, `accept`, `reject`, `end`, and `getStatus`.

## Context

### Prisma schema location
- `services/api/prisma/schema.prisma`
- All models use `@map` for snake_case DB columns and `@@map` for table names
- UUIDs: `@id @default(uuid()) @db.Uuid`
- Enums follow existing naming conventions (PascalCase)
- Add migrations via `pnpm prisma migrate dev --name add-call-sessions`

### New Prisma models to add

```prisma
enum CallType {
  VOICE
  VIDEO
}

enum CallStatus {
  RINGING
  ACTIVE
  ENDED
  REJECTED
  MISSED
}

model CallSession {
  id             String       @id @default(uuid()) @db.Uuid
  conversationId String       @map("conversation_id") @db.Uuid
  initiatorId    String       @map("initiator_id") @db.Uuid
  receiverId     String       @map("receiver_id") @db.Uuid
  callType       CallType     @map("call_type")
  status         CallStatus   @default(RINGING)
  roomName       String       @map("room_name")
  startedAt      DateTime?    @map("started_at")
  endedAt        DateTime?    @map("ended_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  initiator      User         @relation("CallInitiator", fields: [initiatorId], references: [id])
  receiver       User         @relation("CallReceiver", fields: [receiverId], references: [id])

  @@index([conversationId])
  @@map("call_sessions")
}
```

Also add to `Conversation` model:
```prisma
callSessions  CallSession[]
```

Also add to `User` model:
```prisma
initiatedCalls  CallSession[] @relation("CallInitiator")
receivedCalls   CallSession[] @relation("CallReceiver")
```

### tRPC router pattern
Follow exact pattern from `services/api/src/trpc/conversation-router.ts`:
- Import: `import { z } from 'zod'` and `import { TRPCError } from '@trpc/server'`
- Import: `import { router, protectedProcedure } from './middleware.js'`
- Export: `export const callRouter = router({ ... })`
- All procedures use `protectedProcedure`
- Access ctx.prisma and ctx.userId

### tRPC router registration
In `services/api/src/trpc/router.ts`:
- Import callRouter
- Add `call: callRouter` to appRouter

### Procedures to implement

**`call.initiate`** (mutation)
- Input: `{ conversationId: z.string().uuid(), callType: z.enum(['VOICE', 'VIDEO']) }`
- Verify user is participant in conversation
- Check no active/ringing call already exists for this conversation
- Look up the other participant (receiverId)
- Create CallSession with status RINGING, roomName = `call-${conversationId}`
- Return: `{ callId, roomName, receiverId, callType }`

**`call.accept`** (mutation)
- Input: `{ callId: z.string().uuid() }`
- Verify user is the receiver
- Verify call status is RINGING
- Update status to ACTIVE, set startedAt = now()
- Return: `{ callId, roomName, callType }`

**`call.reject`** (mutation)
- Input: `{ callId: z.string().uuid() }`
- Verify user is the receiver
- Verify call status is RINGING
- Update status to REJECTED, set endedAt = now()
- Return: `{ success: true }`

**`call.end`** (mutation)
- Input: `{ callId: z.string().uuid() }`
- Verify user is initiator or receiver
- Verify call status is RINGING or ACTIVE
- Update status to ENDED, set endedAt = now()
- Return: `{ success: true, durationSeconds: number | null }`

**`call.getStatus`** (query)
- Input: `{ callId: z.string().uuid() }`
- Verify user is initiator or receiver
- Return: `{ callId, status, callType, roomName, startedAt, endedAt }`

## Acceptance Criteria

1. `services/api/prisma/schema.prisma` includes `CallSession` model, `CallType` enum, `CallStatus` enum with correct relations to Conversation and User
2. Migration file exists at `services/api/prisma/migrations/*/migration.sql` for call_sessions table
3. `services/api/src/trpc/call-router.ts` exists with all 5 procedures (initiate, accept, reject, end, getStatus)
4. `call.initiate` verifies conversation participation and prevents duplicate active calls
5. `call.accept` / `call.reject` verify caller is the receiver and call is RINGING
6. `call.end` allows either participant to end an active/ringing call
7. `call.getStatus` returns full call state
8. `services/api/src/trpc/router.ts` imports callRouter and registers it as `call: callRouter`

## File Paths
- `services/api/prisma/schema.prisma`
- `services/api/src/trpc/call-router.ts`
- `services/api/src/trpc/router.ts`
