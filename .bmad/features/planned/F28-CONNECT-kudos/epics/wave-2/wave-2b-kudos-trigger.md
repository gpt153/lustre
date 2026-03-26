# Epic: wave-2b-kudos-trigger

**Model:** haiku
**Wave:** 2
**Group:** A (sequential — depends on 2a)

## Description

Implement the trigger mechanism that creates kudos-giving opportunities. When a conversation is archived or a match ends, emit a NATS event that the kudos system consumes to create a prompt opportunity. Store a KudosPrompt record so the mobile/web clients know to show the kudos prompt. Include a stub integration point for SafeDate (F13) triggers.

## Acceptance Criteria

1. `KudosPrompt` model added to Prisma schema: id (UUID), userId (UUID, FK), recipientId (UUID, FK), matchId (UUID, FK to Match, optional), status (enum: PENDING, COMPLETED, DISMISSED), createdAt, expiresAt (default: 7 days from creation). Unique on [userId, recipientId, matchId].
2. NATS event `match.conversation.archived` triggers creation of two KudosPrompt records (one for each participant).
3. tRPC procedure `kudos.getPendingPrompts` returns active (PENDING, not expired) prompts for the authenticated user.
4. tRPC procedure `kudos.dismissPrompt` sets a prompt to DISMISSED status.
5. When `kudos.give` completes successfully, the corresponding KudosPrompt is set to COMPLETED.
6. Expired prompts (older than 7 days) are excluded from queries. Background cleanup optional (not required for MVP).
7. NATS consumer registered in `services/api/src/lib/kudos-consumer.ts`.

## File Paths

- `services/api/prisma/schema.prisma` (KudosPrompt model)
- `services/api/prisma/migrations/` (new migration)
- `services/api/src/lib/kudos-consumer.ts`
- `services/api/src/trpc/kudos-router.ts` (add getPendingPrompts, dismissPrompt)
