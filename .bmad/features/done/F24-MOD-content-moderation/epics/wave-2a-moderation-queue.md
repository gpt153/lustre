# Epic: wave-2a-moderation-queue

**Model:** haiku
**Feature:** F24-MOD-content-moderation

## Goal
Add admin moderation queue procedures to the report router: list reports with full context (message content, profile info, post info), and execute moderation actions (dismiss, warn, temp ban, permanent ban).

## Context
- `report-router.ts` already exists at `services/api/src/trpc/report-router.ts` with `create`, `list`, `resolve`
- `ModerationAction` model exists (id, userId, adminId, actionType, reason?, expiresAt?, createdAt)
- `ModerationActionType` enum: WARNING, TEMP_BAN, PERMANENT_BAN
- `User` model has: `isBanned Boolean`, `bannedUntil DateTime?`, `warningCount Int`
- Admin check: `assertAdmin(userId)` already defined in report-router.ts

## Acceptance Criteria

1. Add `report.getContext` query (admin only) to `report-router.ts`:
   - Input: `{ reportId: string }`
   - Fetches the Report
   - Depending on `report.targetType`:
     - MESSAGE: fetch Message (id, content, mediaUrl, isFiltered, createdAt) + sender Profile (id, displayName)
     - POST: fetch Post (id, text, createdAt) + PostMedia (mediaUrl, contentTags[dimension,value,confidence]) + author Profile
     - PROFILE: fetch Profile (id, displayName, bio, photos[0])
   - Also fetch reporter Profile (displayName)
   - Returns `{ report, context: { type, data } }`

2. Add `report.takeAction` mutation (admin only) to `report-router.ts`:
   - Input: `{ userId: string, actionType: ModerationActionType, reason?: string, durationDays?: number }`
   - Creates a `ModerationAction` record
   - For WARNING: increment `User.warningCount` by 1
   - For TEMP_BAN: set `User.isBanned = true`, `User.bannedUntil = now + durationDays` (default 7 if not provided)
   - For PERMANENT_BAN: set `User.isBanned = true`, `User.bannedUntil = null`
   - Returns `{ actionId }`

3. No changes to `create`, `list`, `resolve` procedures — only additions

## File Paths
- `services/api/src/trpc/report-router.ts` — add getContext query + takeAction mutation
