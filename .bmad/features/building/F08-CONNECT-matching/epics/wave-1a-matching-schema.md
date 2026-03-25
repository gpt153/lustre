# Epic: wave-1a-matching-schema

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — must complete before 1b)

## Description

Add Prisma schema models for the matching system: Swipe, Match, and SeenProfile. Add SwipeAction enum. Add location field to Profile for PostGIS distance queries. Generate and run migration.

## Acceptance Criteria

1. `SwipeAction` enum exists with values: `LIKE`, `PASS`
2. `Swipe` model exists with fields: id (UUID), userId (UUID, FK to User), targetId (UUID, FK to User), action (SwipeAction), createdAt. Unique constraint on [userId, targetId]. Mapped to `swipes`.
3. `Match` model exists with fields: id (UUID), user1Id (UUID, FK to User), user2Id (UUID, FK to User), createdAt. Unique constraint on [user1Id, user2Id]. Mapped to `matches`.
4. `SeenProfile` model exists with fields: id (UUID), userId (UUID, FK to User), targetId (UUID, FK to User), seenAt (DateTime, default now). Unique constraint on [userId, targetId]. Mapped to `seen_profiles`.
5. `Profile` model has new optional field `location` of type `Unsupported("geography(Point,4326)")?` mapped to `location`
6. `User` model has new relation fields: `swipes Swipe[]`, `swipesReceived Swipe[] @relation("swipesReceived")`, `matchesAsUser1 Match[] @relation("matchesAsUser1")`, `matchesAsUser2 Match[] @relation("matchesAsUser2")`, `seenProfiles SeenProfile[]`
7. Prisma migration generated and applies cleanly
8. A raw SQL statement in the migration creates a GIST index on `profiles.location` using `geography_ops`

## File Paths

- `services/api/prisma/schema.prisma`
- `services/api/prisma/migrations/` (new migration)
