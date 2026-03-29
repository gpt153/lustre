# Epic: wave-1a-spicy-level-schema

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — first)

## Description

Replace the current ContentPreference enum (SOFT, OPEN, EXPLICIT, NO_DICK_PICS) with a new SpicyLevel enum and independent toggle-based filtering. Add post types (Moment, Vibe, Prompt Response) and daily prompt model. This is the schema foundation for the entire feed evolution.

## Acceptance Criteria

1. New enum `SpicyLevel` with values: `VANILLA`, `SULTRY`, `STEAMY`, `EXPLICIT`
2. New enum `PostType` with values: `MOMENT`, `VIBE`, `PROMPT_RESPONSE`
3. `Post` model extended with:
   - `postType PostType @default(MOMENT)` — type of post
   - `spicyLevel SpicyLevel @default(VANILLA)` — content rating
   - `expiresAt DateTime?` — null for permanent posts, set for Vibes (24h from creation)
4. New model `SpicyLevelFilter` replacing `UserContentFilter.preset`:
   - `id`, `userId` (unique), `showVanilla Boolean @default(true)`, `showSultry Boolean @default(true)`, `showSteamy Boolean @default(false)`, `showExplicit Boolean @default(false)`, `updatedAt`
   - Relation to User
5. New model `DailyPrompt`:
   - `id`, `text String @db.VarChar(500)`, `spicyLevel SpicyLevel @default(VANILLA)`, `isActive Boolean @default(true)`, `createdAt`
6. `Post` has optional relation to `DailyPrompt` via `promptId` (for PROMPT_RESPONSE type)
7. Existing `UserContentFilter` model kept for backward compatibility (tag-based filtering per dimension) but `ContentPreference` enum usage is superseded by `SpicyLevelFilter`
8. Migration file created and Prisma validates

## File Paths
- `services/api/prisma/schema.prisma`
- `services/api/prisma/migrations/[timestamp]_f39_spicy_levels/migration.sql`
