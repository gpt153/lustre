# Epic: wave-1b-admin-api
**Wave:** 1
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Create a new `admin` tRPC router with user management and moderation endpoints, and register it in the app router.

## Context
- `services/api/src/trpc/middleware.ts` — exports `adminProcedure` (added in wave-1a)
- `services/api/src/trpc/router.ts` — main app router; needs `admin: adminRouter` added
- `services/api/src/trpc/report-router.ts` — already has list/resolve/getContext/takeAction on the `report` namespace; `admin` router wraps user management separately
- Prisma models relevant: `User` (id, displayName, status, email, createdAt, isBanned, bannedUntil, warningCount, filteredSentCount), `Profile` (displayName, gender, createdAt), `ModerationAction`, `Report`
- UserStatus enum: `PENDING`, `PENDING_EMAIL`, `ACTIVE`
- ModerationActionType: `WARNING`, `TEMP_BAN`, `PERMANENT_BAN`
- ReportStatus: `PENDING`, `REVIEWED`, `DISMISSED`
- ReportTargetType: `MESSAGE`, `POST`, `PROFILE`
- Pattern: use `adminProcedure` from `./middleware.js`

## Acceptance Criteria
1. `services/api/src/trpc/admin-router.ts` created with `adminRouter` exported
2. `admin.searchUsers` query — input: `{ query: string, cursor?: string, limit?: number (default 20, max 100) }` — searches users by displayName (profile) using case-insensitive contains, returns `{ users, nextCursor }` with fields: id, displayName, email, status, isBanned, bannedUntil, warningCount, createdAt
3. `admin.getUser` query — input: `{ userId: string (uuid) }` — returns full user info: id, email, status, isBanned, bannedUntil, warningCount, filteredSentCount, createdAt, profile (displayName, gender), moderationActions (last 10)
4. `admin.suspendUser` mutation — input: `{ userId: string (uuid), durationDays: number (1-365), reason?: string }` — sets `isBanned=true`, `bannedUntil=now+durationDays`, creates `ModerationAction(TEMP_BAN)` with `adminId=ctx.userId`
5. `admin.banUser` mutation — input: `{ userId: string (uuid), reason?: string }` — sets `isBanned=true`, `bannedUntil=null` (permanent), creates `ModerationAction(PERMANENT_BAN)` with `adminId=ctx.userId`
6. `admin.getReports` query — input: `{ status?: ReportStatus, cursor?: string, limit?: number }` — delegates to same logic as `report.list` but from adminRouter
7. `admin.resolveReport` mutation — input: `{ reportId: string (uuid), status: 'REVIEWED'|'DISMISSED' }` — same as `report.resolve` but from adminRouter
8. All procedures use `adminProcedure` (throws FORBIDDEN for non-admins)
9. `router.ts` updated: imports `adminRouter`, adds `admin: adminRouter` to `appRouter`

## File Paths
- `services/api/src/trpc/admin-router.ts` (CREATE)
- `services/api/src/trpc/router.ts` (EDIT — add admin import and namespace)
