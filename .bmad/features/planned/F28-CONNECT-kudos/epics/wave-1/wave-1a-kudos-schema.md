# Epic: wave-1a-kudos-schema

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — must complete before 1b)

## Description

Add Prisma schema models for the kudos/reputation system: BadgeCategory, Badge, Kudos, KudosBadge. Create a seed script that populates all MVP badge categories and badges (5 categories, ~24 badges total). Add spicyOnly boolean flag to Badge model for Spicy-mode filtering.

## Acceptance Criteria

1. `BadgeCategory` model exists with fields: id (UUID), name (String), slug (String, unique), sortOrder (Int), createdAt. Mapped to `badge_categories`.
2. `Badge` model exists with fields: id (UUID), categoryId (UUID, FK to BadgeCategory), name (String), slug (String, unique), description (String, optional), spicyOnly (Boolean, default false), sortOrder (Int), createdAt. Mapped to `badges`.
3. `Kudos` model exists with fields: id (UUID), giverId (UUID, FK to User), recipientId (UUID, FK to User), matchId (UUID, FK to Match, optional), safeDateId (UUID, optional — future FK), createdAt. Mapped to `kudos`.
4. `KudosBadge` model exists with fields: id (UUID), kudosId (UUID, FK to Kudos), badgeId (UUID, FK to Badge), createdAt. Mapped to `kudos_badges`.
5. Unique constraint on `Kudos` for [giverId, recipientId, matchId] to enforce one kudos per interaction.
6. Seed script in `services/api/prisma/seed-badges.ts` populates all 5 categories and ~24 badges matching the PRD badge list.
7. Prisma migration generated and applies cleanly.
8. Relations wired: User has `kudosGiven Kudos[]` and `kudosReceived Kudos[]`; BadgeCategory has `badges Badge[]`; Kudos has `badges KudosBadge[]`.

## File Paths

- `services/api/prisma/schema.prisma`
- `services/api/prisma/migrations/` (new migration)
- `services/api/prisma/seed-badges.ts`
