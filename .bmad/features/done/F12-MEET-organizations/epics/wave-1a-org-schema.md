# Epic: wave-1a-org-schema
**Model:** haiku
**Wave:** 1 / Group A (sequential — must complete before wave-1b)

## Goal
Add Organization, OrgMember, and OrgVerification Prisma models to the schema. Add necessary enums. Wire User relations.

## Files to modify
1. `services/api/prisma/schema.prisma`

## Acceptance Criteria
1. Enum `OrgType` exists with values: CLUB, ASSOCIATION, BUSINESS, EVENT_COMPANY
2. Enum `OrgMemberRole` exists with values: OWNER, ADMIN, MODERATOR, MEMBER
3. Enum `OrgVerificationStatus` exists with values: PENDING, VERIFIED, REJECTED
4. Model `Organization` exists with fields: id (uuid), name (varchar 200), description (varchar 4000, optional), type (OrgType), locationName (varchar 500, optional), contactEmail (optional), contactPhone (optional), websiteUrl (optional), coverImageUrl (optional), verified (bool default false), createdById (uuid FK→User), createdAt, updatedAt. Table: `organizations`
5. Model `OrgMember` exists with fields: id (uuid), orgId (FK→Organization cascade), userId (FK→User cascade), role (OrgMemberRole default MEMBER), joinedAt. Unique constraint on [orgId, userId]. Table: `org_members`
6. Model `OrgVerification` exists with fields: id (uuid), orgId (unique FK→Organization cascade), status (OrgVerificationStatus default PENDING), swishPaymentId (optional unique), reviewNotes (optional), requestedAt (default now), reviewedAt (optional). Table: `org_verifications`
7. User model has relation fields: `orgsCreated Organization[] @relation("orgsCreated")` and `orgMemberships OrgMember[]`
8. Organization model has relation fields to OrgMember (members), OrgVerification (verification), User (creator)
9. All field names use snake_case `@map()` annotations consistent with existing schema
10. No TODO/FIXME comments

## Context
- Prisma schema is at `services/api/prisma/schema.prisma`
- Follow exact patterns of existing models: Group, GroupMember, GroupModerator
- All IDs are `String @id @default(uuid()) @db.Uuid`
- All FK fields use `@db.Uuid`
- snake_case table/column names via `@@map()` and `@map()`
- `updatedAt` fields use `@updatedAt`
- Cascades use `onDelete: Cascade`
