# Epic: wave-1b-safedate-api
**Model:** sonnet
**Wave:** 1 / Group A (after 1a)

## Goal
Create the tRPC safedate router with activate, checkin, extend, end procedures plus an escalation background service.

## Files to create/modify
- `services/api/src/trpc/safedate-router.ts` (CREATE)
- `services/api/src/lib/safedate-escalation.ts` (CREATE)
- `services/api/src/trpc/router.ts` (MODIFY — add safedate router)
- `services/api/src/server.ts` (MODIFY — start escalation service on boot)

## Acceptance criteria (max 10)
1. `safedate.activate` — protectedProcedure: input {targetDescription: string, durationMinutes: int (10-480), safetyContacts: [{name,phone}] (1-5), pin: string (4-8 digits)}. Creates SafeDate + SafetyContacts, sets expiresAt = now+durationMinutes, hashes PIN with bcrypt (cost 10), generates shareToken (uuid), returns {id, expiresAt, shareToken}. Throws BAD_REQUEST if < 1 safety contact. NEVER deducts tokens.
2. `safedate.checkin` — protectedProcedure: input {id: string, pin: string}. Validates PIN with bcrypt. Resets expiresAt = now+original_duration_minutes, sets status=CHECKED_IN, sets checkedInAt=now(). Returns {expiresAt}. Throws UNAUTHORIZED on wrong PIN. Throws NOT_FOUND if SafeDate not found or not owned by caller.
3. `safedate.extend` — protectedProcedure: input {id: string, additionalMinutes: int (5-120)}. Extends expiresAt by additionalMinutes. Returns {expiresAt}. Only works on ACTIVE/CHECKED_IN SafeDates.
4. `safedate.end` — protectedProcedure: input {id: string}. Sets status=COMPLETED, completedAt=now(), deletionScheduledAt=now+24h. Returns {success: true}.
5. `safedate.get` — protectedProcedure: input {id: string}. Returns SafeDate with safetyContacts (no PIN hash). Only owner can call.
6. `safedate.list` — protectedProcedure. Returns user's SafeDates ordered by createdAt desc.
7. Escalation service (`safedate-escalation.ts`): exports `startEscalationService()` that runs `setInterval` every 60 seconds. Checks for SafeDates with status ACTIVE/CHECKED_IN where expiresAt < now(). Sends SMS via Twilio to all safety contacts. Updates status to ESCALATED, escalatedAt=now(). SMS message: "NÖDSIGNAL från Lustre SafeDate: [user displayName] har inte checkat in. Senaste GPS: lat/lng. Status: eskalerad. Dela denna länk med polis om nödvändigt: https://lovelustre.com/safe/[shareToken]"
8. Twilio SMS: uses `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` env vars. Import `twilio` from `'twilio'`. Fire-and-forget with error logging. Gracefully skips if env vars not set (logs warning).
9. Router wired: `safedate: safedateRouter` added to appRouter in `router.ts`
10. `startEscalationService()` called in `server.ts` after server starts (fire-and-forget)

## Context
- Import pattern: `import { router, protectedProcedure } from './middleware.js'`
- Prisma: `ctx.prisma.safeDate`, `ctx.prisma.safetyContact`
- Auth: `ctx.userId` is the authenticated user id
- Error pattern: `throw new TRPCError({ code: 'NOT_FOUND', message: '...' })`
- No token deduction — SafeDate is always free (per PRD FR-5)
- bcrypt: `import bcrypt from 'bcryptjs'` (already in package.json pattern — use `bcryptjs`)
- Read `services/api/src/trpc/router.ts` and `services/api/src/server.ts` before modifying
- Read an existing router like `services/api/src/trpc/gatekeeper-router.ts` for patterns
