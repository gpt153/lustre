# Epic: wave-1b-consent-api
**Model:** haiku
**Wave:** 1
**Group:** A (sequential second — depends on wave-1a)

## Goal
Create tRPC consent router with procedures: initiate, confirm, getRecordings, revoke, delete. Register in appRouter.

## Acceptance Criteria
1. `consent.initiate` (protected): input `{ participantId: uuid, gpsLat: float, gpsLng: float, bluetoothProof: string? }` — creates ConsentRecord(PENDING), creates RecordingAccess for both users, returns `{ consentRecordId, expiresAt }`
2. `consent.confirm` (protected): input `{ consentRecordId: uuid, gpsLat: float, gpsLng: float }` — validates participant is the caller, validates GPS proximity (< 100m), updates status to CONFIRMED, returns `{ consentRecordId, status }`
3. `consent.getRecordings` (protected): returns recordings where caller has active RecordingAccess, includes consentRecord, status, drmUrl (only if READY and access active)
4. `consent.revoke` (protected): input `{ recordingId: uuid }` — marks RecordingAccess.isActive=false for caller, creates RecordingRevocation, if both parties revoked also marks Recording.status=DELETED, returns `{ success }`
5. `consent.delete` (protected): input `{ recordingId: uuid }` — only callable by initiator or participant, sets Recording.status=DELETED, deletedAt=now(), removes drmUrl, returns `{ success }`
6. GPS proximity check: uses Haversine formula, throws BAD_REQUEST if > 100m apart
7. Caller must be initiator or participant (NOT_FOUND if not)
8. `consentRouter` exported from `src/trpc/consent-router.ts`
9. Registered in `src/trpc/router.ts` as `consent: consentRouter`

## File Paths
- `services/api/src/trpc/consent-router.ts` — new file
- `services/api/src/trpc/router.ts` — add consent import and registration

## Codebase Context
- Pattern: `import { z } from 'zod'; import { TRPCError } from '@trpc/server'; import { router, protectedProcedure } from './middleware.js'`
- Context has: `ctx.prisma` (PrismaClient), `ctx.userId` (string)
- Auth: `protectedProcedure` throws UNAUTHORIZED if not logged in
- Haversine formula needed for GPS proximity check (implement inline)
- See `services/api/src/trpc/safedate-router.ts` for reference pattern
- All imports use `.js` extension (ESM)
