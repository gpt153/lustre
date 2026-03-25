# Epic: wave-1c-session-management
**Model:** haiku
**Wave:** 1 — Group A (runs third, after wave-1b)

## Goal
Add CoachSession and SessionMessage Prisma models, a tRPC coach router for session lifecycle, and per-minute token billing.

## Context
- Prisma schema at `services/api/prisma/schema.prisma`
- Existing token system: `services/api/src/lib/tokens.ts` — `debitTokens(prisma, userId, amount, type, referenceId?)`
- TokenTransactionType enum currently has: GATEKEEPER, TOPUP, REFUND
- tRPC pattern: see `services/api/src/trpc/gatekeeper-router.ts`, `services/api/src/trpc/router.ts`
- Auth middleware: `protectedProcedure` from `./middleware.js`
- Session costs: voice = 15 tokens/min, text = 2 tokens/min

## File Paths to Create/Modify
1. `services/api/prisma/schema.prisma` — add enums + models
2. `services/api/src/trpc/coach-router.ts` — new file
3. `services/api/src/trpc/router.ts` — import + register `coachRouter`
4. `services/api/src/lib/tokens.ts` — add COACH_SESSION to TokenTransactionType usage (type assertion)
5. `services/api/src/routes/coach.ts` — already exists from wave-1a, no changes needed

## Schema Changes (add to schema.prisma)

```prisma
enum CoachPersona {
  COACH
  PARTNER
}

enum CoachMode {
  VOICE
  TEXT
}

enum CoachSessionStatus {
  PENDING
  ACTIVE
  ENDED
}

model CoachSession {
  id            String             @id @default(uuid()) @db.Uuid
  userId        String             @map("user_id") @db.Uuid
  persona       CoachPersona
  mode          CoachMode
  status        CoachSessionStatus @default(PENDING)
  roomName      String             @map("room_name")
  startedAt     DateTime?          @map("started_at")
  endedAt       DateTime?          @map("ended_at")
  durationSecs  Int                @default(0) @map("duration_secs")
  tokensDebited Int                @default(0) @map("tokens_debited")
  createdAt     DateTime           @default(now()) @map("created_at")
  user          User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages      SessionMessage[]

  @@index([userId])
  @@map("coach_sessions")
}

model SessionMessage {
  id        String   @id @default(uuid()) @db.Uuid
  sessionId String   @map("session_id") @db.Uuid
  role      String   // "user" | "assistant"
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  session   CoachSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@map("session_messages")
}
```

Also add `COACH_SESSION` to `enum TokenTransactionType` and add `coachSessions CoachSession[]` to User model.

## tRPC Router (coach-router.ts)

Procedures:
- `create`: input `{ persona: CoachPersona, mode: CoachMode, roomName: string }` → creates CoachSession(PENDING), returns session
- `start`: input `{ sessionId: string }` → sets status=ACTIVE, startedAt=now()
- `end`: input `{ sessionId: string, durationSecs: number }` → sets status=ENDED, endedAt=now(), calculates tokens = ceil(durationSecs/60) * costPerMin, calls debitTokens, sets tokensDebited
- `list`: no input → returns user's sessions ordered by createdAt desc, last 20
- `get`: input `{ sessionId: string }` → returns session (must belong to caller)

## Acceptance Criteria
1. Prisma schema has CoachPersona, CoachMode, CoachSessionStatus enums and CoachSession, SessionMessage models exactly as specified above
2. TokenTransactionType enum includes COACH_SESSION
3. User model has `coachSessions CoachSession[]` relation
4. `coach-router.ts` exports `coachRouter` with all 5 procedures
5. `coach.end` debits tokens: voice = 15 tokens/min, text = 2 tokens/min, minimum 1 minute charged
6. `coach.end` uses type `'COACH_SESSION'` for `debitTokens` call (cast as any if needed to avoid type error)
7. `router.ts` imports coachRouter and registers it as `coach: coachRouter`
8. No TODO comments, no unimplemented stubs
