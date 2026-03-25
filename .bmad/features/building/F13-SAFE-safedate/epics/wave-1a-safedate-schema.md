# Epic: wave-1a-safedate-schema
**Model:** haiku
**Wave:** 1 / Group A

## Goal
Add SafeDate Prisma models to `services/api/prisma/schema.prisma`.

## Files to modify
- `services/api/prisma/schema.prisma`

## Acceptance criteria (max 10)
1. New enum `SafeDateStatus` with values: ACTIVE, CHECKED_IN, ESCALATED, COMPLETED
2. New model `SafeDate` with fields: id (uuid), userId (uuid FK→User), targetDescription (String), durationMinutes (Int), pinHash (String), status (SafeDateStatus default ACTIVE), expiresAt (DateTime), checkedInAt (DateTime?), escalatedAt (DateTime?), completedAt (DateTime?), deletionScheduledAt (DateTime?), shareToken (String unique), createdAt, updatedAt. @@map("safe_dates")
3. New model `SafetyContact` with fields: id (uuid), safeDateId (uuid FK→SafeDate cascade), name (String), phone (String), smsSentAt (DateTime?), createdAt. @@map("safety_contacts")
4. New model `GPSLog` with fields: id (uuid), safeDateId (uuid FK→SafeDate cascade), latEncrypted (String), lngEncrypted (String), accuracy (Float?), iv (String), recordedAt (DateTime default now()), createdAt. @@index([safeDateId, recordedAt]). @@map("gps_logs")
5. User model gets relation: `safeDates SafeDate[]`
6. SafeDate gets relation to SafetyContact[] and GPSLog[]
7. All new models use `@db.Uuid` on UUID fields
8. `@map` snake_case for all camelCase field names
9. No existing models modified (only additions + User relation)
10. Schema is valid Prisma syntax (no syntax errors)

## Context
- Existing schema path: `services/api/prisma/schema.prisma`
- Pattern: `id String @id @default(uuid()) @db.Uuid`, FK: `userId String @map("user_id") @db.Uuid`
- All models use `@@map("snake_case_plural")`
- DateTime fields use `@default(now()) @map("snake_case")`
- updatedAt uses `@updatedAt`
- READ the existing schema first before editing — append after the last model (Organization/OrgVerification)
