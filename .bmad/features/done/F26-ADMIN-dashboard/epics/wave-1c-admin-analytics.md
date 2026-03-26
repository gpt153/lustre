# Epic: wave-1c-admin-analytics
**Wave:** 1
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Add analytics query endpoints to the admin router: DAU/MAU, registrations by period, gender ratio, revenue summary, AI cost summary.

## Context
- `services/api/src/trpc/admin-router.ts` — created in wave-1b; add analytics procedures to it
- `services/api/src/trpc/middleware.ts` — exports `adminProcedure`
- Prisma models for analytics:
  - `User` — createdAt (registrations), status
  - `Session` — createdAt (DAU/MAU proxy — count distinct userId per day/month)
  - `Profile` — gender field (Gender enum: MALE, FEMALE, NON_BINARY, etc.)
  - `Payment` — amount (Decimal), completedAt, status=PAID (revenue)
  - `TokenTransaction` — amount (Int), type (GATEKEEPER, COACH_SESSION, TOPUP, etc.), createdAt (AI costs = sum of GATEKEEPER + COACH_SESSION debits)
- Use `ctx.prisma.$queryRaw` for efficient date-grouped queries
- All analytics procedures use `adminProcedure`

## Acceptance Criteria
1. `admin.getOverview` query (no input) — returns:
   - `dau`: count of distinct userId in Session where createdAt >= today (UTC midnight)
   - `mau`: count of distinct userId in Session where createdAt >= 30 days ago
   - `totalUsers`: count of all User records with status=ACTIVE
   - `pendingReports`: count of Report where status=PENDING
2. `admin.getRegistrations` query — input: `{ days: number (7|30|90, default 30) }` — returns array of `{ date: string (YYYY-MM-DD), count: number }` for each day in the period; uses `DATE_TRUNC('day', created_at)` grouping
3. `admin.getGenderRatio` query (no input) — returns array of `{ gender: string, count: number }` — counts Profile.gender for all profiles
4. `admin.getRevenue` query — input: `{ days: number (7|30|90, default 30) }` — returns:
   - `totalSek`: sum of Payment.amount where status=PAID in the period
   - `byDay`: array of `{ date: string, amountSek: number }` for each day
5. `admin.getAiCosts` query — input: `{ days: number (7|30|90, default 30) }` — returns:
   - `totalTokens`: sum of absolute value of TokenTransaction.amount where type IN (GATEKEEPER, COACH_SESSION) AND amount < 0 (debits) in the period
   - `byType`: array of `{ type: string, tokens: number }` grouped by transaction type for the period
6. All 5 new procedures added to the existing `adminRouter` in `admin-router.ts`

## File Paths
- `services/api/src/trpc/admin-router.ts` (EDIT — add analytics procedures)
