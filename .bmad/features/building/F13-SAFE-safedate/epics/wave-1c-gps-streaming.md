# Epic: wave-1c-gps-streaming
**Model:** sonnet
**Wave:** 1 / Group A (after 1b)

## Goal
Add GPS ingestion tRPC procedures and a live-location query endpoint for safety contacts.

## Files to create/modify
- `services/api/src/trpc/safedate-router.ts` (MODIFY — add GPS procedures)

## Acceptance criteria (max 10)
1. `safedate.logGPS` — protectedProcedure: input {id: string, lat: number (-90..90), lng: number (-180..180), accuracy: number optional}. Validates caller owns the SafeDate. Encrypts lat and lng separately with AES-256-GCM using the existing `encrypt()` function from `services/api/src/auth/crypto.ts`. Stores GPSLog record (latEncrypted, lngEncrypted, iv, accuracy, recordedAt=now()). Returns {success: true}. Throws BAD_REQUEST for out-of-range coords.
2. `safedate.getLiveLocation` — publicProcedure: input {shareToken: string}. Looks up SafeDate by shareToken. Returns last 50 GPS points decrypted {lat, lng, accuracy, recordedAt}, plus SafeDate {status, expiresAt, escalatedAt}. Throws NOT_FOUND if shareToken invalid.
3. GPS rate limiting: max 1 GPS log per 3 seconds per SafeDate (check last GPSLog.recordedAt, throw TOO_MANY_REQUESTS if too recent)
4. GPS data encrypted at rest: latEncrypted and lngEncrypted are AES-256-GCM encrypted strings; iv stored per record
5. `safedate.getLiveLocation` decrypts GPS points using `decrypt(encrypted, iv)` from crypto.ts before returning
6. Only active SafeDates (ACTIVE, CHECKED_IN, ESCALATED) return live GPS; COMPLETED returns empty GPS array
7. At least 1 index exists on GPSLog: `@@index([safeDateId, recordedAt])` (already in schema from 1a)
8. No new files needed — all GPS procedures added to the existing `safedate-router.ts` from epic 1b

## Context
- `encrypt()` and `decrypt()` are in `services/api/src/auth/crypto.ts`: `encrypt(plaintext)` returns `{encrypted, iv}`, `decrypt(encrypted, iv)` returns string
- Import: `import { encrypt, decrypt } from '../auth/crypto.js'`
- Prisma: `ctx.prisma.gPSLog` (Prisma generates camelCase from GPSLog → gPSLog)
- publicProcedure does NOT require auth (safety contacts need to view without login)
- Read `services/api/src/trpc/safedate-router.ts` (created in 1b) before editing
