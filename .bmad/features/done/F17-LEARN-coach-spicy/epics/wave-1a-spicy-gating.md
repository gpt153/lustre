# Epic: wave-1a-spicy-gating

**Wave:** 1 — Group A (runs first, sequential before wave-1b)
**Model:** haiku
**Estimate:** small

## Goal
Add spicy mode field to Profile, isSpicy flag to LearnModule, and gate spicy module access behind (1) vanilla level 6 completion + (2) spicyModeEnabled=true.

## Context
- Schema: `services/api/prisma/schema.prisma`
- Module router: `services/api/src/trpc/module-router.ts`
- Profile router: `services/api/src/trpc/profile-router.ts`
- Existing module unlock logic in `completeLesson`: `learnModule.updateMany({ where: { order: module.order + 1 } }, { data: { isUnlocked: true } })`
- Vanilla level 6 = UserModuleProgress for LearnModule with order=6 has badgeAwardedAt != null
- Spicy modules will use orders 101-108 to avoid conflict with vanilla @unique constraint
- Migration dir: `services/api/prisma/migrations/`

## Acceptance Criteria

1. `Profile` model gains `spicyModeEnabled Boolean @default(false) @map("spicy_mode_enabled")` field
2. `LearnModule` model gains `isSpicy Boolean @default(false) @map("is_spicy")` field
3. Migration file `services/api/prisma/migrations/20260325110000_add_spicy_mode/migration.sql` adds both columns with correct ALTER TABLE statements
4. `module.list` procedure filters out modules where `isSpicy=true` when caller's `profile.spicyModeEnabled=false`
5. `module.list` includes `isSpicy` in the returned module objects
6. `module.startLesson` throws `TRPCError({ code: 'FORBIDDEN', message: 'Requires Spicy mode and completion of vanilla module 6' })` if the lesson belongs to a spicy module AND (spicyModeEnabled=false OR vanilla level 6 not completed)
7. `profile.toggleSpicyMode` mutation (input: `{ enabled: boolean }`) updates `profile.spicyModeEnabled` for the authed user and returns updated profile
8. Spicy module auto-unlock is NOT chained from vanilla completeLesson — spicy modules unlock only via the gating check (no `isUnlocked` propagation into spicy range)

## File Paths

- `services/api/prisma/schema.prisma`
- `services/api/prisma/migrations/20260325110000_add_spicy_mode/migration.sql`
- `services/api/src/trpc/module-router.ts`
- `services/api/src/trpc/profile-router.ts`
