# Epic: wave-1a-intention-schema

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — must complete before 1b)

## Description

Add Prisma schema models for the Intentions system. The Intention model stores all search criteria fields, links to the user, and has status/expiry management. Add enums for IntentionStatus and IntentionSeeking. Add a join table for kink interests on Intentions.

## Acceptance Criteria

1. `IntentionStatus` enum exists with values: `ACTIVE`, `PAUSED`, `EXPIRED`, `DELETED`.
2. `IntentionSeeking` enum exists with values: `CASUAL`, `RELATIONSHIP`, `FRIENDSHIP`, `EXPLORATION`, `EVENT`, `OTHER`.
3. `IntentionAvailability` enum exists with values: `WEEKDAYS`, `WEEKENDS`, `FLEXIBLE`.
4. `Intention` model exists with fields: id (UUID), userId (UUID, FK to User), seeking (IntentionSeeking), genderPreferences (Gender[], array), ageMin (Int), ageMax (Int), distanceRadiusKm (Int), orientationMatch (Orientation[], array), availability (IntentionAvailability), relationshipStructure (RelationshipType), status (IntentionStatus, default ACTIVE), createdAt, updatedAt, expiresAt (DateTime, default now + 30 days). Mapped to `intentions`.
5. `IntentionKinkTag` join model exists with fields: id (UUID), intentionId (UUID, FK to Intention), kinkTagId (UUID, FK to KinkTag), createdAt. Mapped to `intention_kink_tags`. Unique on [intentionId, kinkTagId].
6. User model has new relation: `intentions Intention[]`.
7. Index on `intentions` for [status, seeking, expiresAt] to support fast feed queries.
8. Prisma migration generated and applies cleanly.

## File Paths

- `services/api/prisma/schema.prisma`
- `services/api/prisma/migrations/` (new migration)
