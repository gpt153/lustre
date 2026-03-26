# Epic: wave-1a-admin-auth
**Wave:** 1
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Extract admin auth into a shared `adminProcedure` tRPC middleware and add an admin seed script. Admin identity is controlled by `ADMIN_USER_IDS` env var (comma-separated UUIDs) — no DB role needed.

## Context
- `services/api/src/trpc/middleware.ts` — exports `router`, `publicProcedure`, `protectedProcedure`
- `services/api/src/trpc/report-router.ts` — has local `assertAdmin` helper that checks `ADMIN_USER_IDS`; this pattern should be extracted to shared middleware
- `services/api/src/trpc/router.ts` — main app router, needs `admin` namespace added later (wave-1b will add it)
- `services/api/prisma/seed.ts` — existing seed file; add admin user seeding at the bottom

## Acceptance Criteria
1. `services/api/src/trpc/middleware.ts` exports `adminProcedure` (extends `protectedProcedure`) that throws FORBIDDEN if `ctx.userId` not in `ADMIN_USER_IDS`
2. `report-router.ts` updated to import and use `adminProcedure` instead of local `assertAdmin` for `list`, `resolve`, `getContext`, `takeAction` procedures
3. `services/api/prisma/seed.ts` has a `seedAdminUser` function at the bottom: creates a User with id `00000000-0000-0000-0000-000000000001` (system), email `admin@lovelustre.com`, status `ACTIVE`, passwordHash from bcrypt of `"admin123"`, and logs `Admin user seeded: <id>`
4. No `assertAdmin` function remains in `report-router.ts` (fully replaced by `adminProcedure`)
5. `ADMIN_USER_IDS` env var parsing is ONLY in `middleware.ts` (DRY — not duplicated)
6. All imports use `.js` extension (ESM pattern)

## File Paths
- `services/api/src/trpc/middleware.ts` (EDIT)
- `services/api/src/trpc/report-router.ts` (EDIT)
- `services/api/prisma/seed.ts` (EDIT — append seedAdminUser)
