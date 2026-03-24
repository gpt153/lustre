# Epic: wave-1a-profile-schema
**Model:** haiku
**Wave:** 1, Group A (first)

## Description
Add Prisma models for Profile, ProfilePhoto, and kink tags. Add enums for gender, orientation, relationship type, and seeking preferences. Run migration.

## Acceptance Criteria
1. `Gender` enum with 10+ values: MAN, WOMAN, NON_BINARY, TRANS_MAN, TRANS_WOMAN, GENDERQUEER, GENDERFLUID, AGENDER, BIGENDER, TWO_SPIRIT, OTHER
2. `Orientation` enum: STRAIGHT, GAY, LESBIAN, BISEXUAL, PANSEXUAL, QUEER, ASEXUAL, DEMISEXUAL, OTHER
3. `RelationshipType` enum: SINGLE, PARTNERED, MARRIED, OPEN_RELATIONSHIP, POLYAMOROUS, OTHER
4. `Seeking` enum: FRIENDSHIP, DATING, CASUAL, RELATIONSHIP, PLAY_PARTNER, NETWORKING, OTHER
5. `ContentPreference` enum: SOFT, OPEN, EXPLICIT, NO_DICK_PICS
6. `KinkInterestLevel` enum: CURIOUS, LIKE, LOVE
7. `Profile` model with fields: id, userId (unique FK to User), displayName, bio, age (Int), gender, orientation, relationshipType, contentPreference, verified (Boolean, default false), location (geography point via raw SQL), createdAt, updatedAt. Map to "profiles" table.
8. `ProfilePhoto` model: id, profileId (FK), url, thumbnailSmall, thumbnailMedium, thumbnailLarge, position (Int for ordering), isPublic (Boolean default true), createdAt. Map to "profile_photos" table.
9. `KinkTag` model: id, name (unique), category, createdAt. Map to "kink_tags" table.
10. `ProfileKinkTag` model: id, profileId (FK), kinkTagId (FK), interestLevel (KinkInterestLevel), isPublic (Boolean default true), unique constraint on [profileId, kinkTagId]. Map to "profile_kink_tags" table.

## File Paths
1. `services/api/prisma/schema.prisma` — add all new enums and models
2. `services/api/prisma/migrations/<timestamp>_add_profiles/migration.sql` — generated migration

## Context
- Existing schema has User, EncryptedIdentity, Session, Payment models
- User model needs a `profile Profile?` relation added
- Use `@map("snake_case")` for all column names, `@@map("table_name")` for tables
- Use `@db.Uuid` for all UUID fields
- Use `@default(uuid())` for id fields
- All FKs should have `onDelete: Cascade`
- After editing schema.prisma, run: `cd services/api && npx prisma generate` (do NOT run migrate — just generate)
