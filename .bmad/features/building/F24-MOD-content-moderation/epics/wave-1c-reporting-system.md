# Epic: wave-1c-reporting-system

**Model:** haiku
**Feature:** F24-MOD-content-moderation

## Goal
Implement a user reporting system: tRPC router for creating reports, listing them (admin), and resolving them.

## Context
- `Report` model already exists in schema (added in wave-1a):
  - reporterId, targetId, targetType (MESSAGE/POST/PROFILE), category (HARASSMENT/SPAM/UNDERAGE/NON_CONSENSUAL/OTHER), description?, status (PENDING/REVIEWED/DISMISSED), reviewedBy?, reviewedAt?
- tRPC routers live at `services/api/src/trpc/`
- Main router at `services/api/src/trpc/router.ts` — need to add `reportRouter`
- Auth pattern: use `protectedProcedure` (requires `ctx.userId`), admin check = `ctx.userId` must be in a hardcoded list OR use a `Profile.isAdmin` flag — check if `User` has an `isAdmin` field in schema, if not use a simple env-var admin check

## Acceptance Criteria

1. `services/api/src/trpc/report-router.ts` created with:
   - `report.create` (protected): input `{ targetId: string, targetType: ReportTargetType, category: ReportCategory, description?: string }` — creates Report, returns `{ id }`. Prevent duplicate: if reporter already reported same target, throw `CONFLICT`.
   - `report.list` (protected, admin only): input `{ status?: ReportStatus, cursor?: string, limit?: number }` — returns paginated list of reports with reporter info (username), targetType, category, status, createdAt. Admin check: verify `ctx.userId` exists in `ADMIN_USER_IDS` env var (comma-separated UUIDs), throw `FORBIDDEN` if not admin.
   - `report.resolve` (protected, admin only): input `{ reportId: string, status: 'REVIEWED' | 'DISMISSED' }` — updates report status + sets reviewedBy + reviewedAt, returns updated report.

2. `report-router.ts` imports Zod for input validation, uses `TRPCError` for errors

3. `services/api/src/trpc/router.ts` updated to import and register `reportRouter` as `report`

4. Proper index already exists on `(status, createdAt)` (from migration) — use it for list ordering

## File Paths
- `services/api/src/trpc/report-router.ts` — new file
- `services/api/src/trpc/router.ts` — add import + register reportRouter
