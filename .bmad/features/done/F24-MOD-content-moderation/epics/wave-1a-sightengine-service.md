# Epic: wave-1a-sightengine-service

**Model:** sonnet
**Feature:** F24-MOD-content-moderation

## Goal
Extend the existing Sightengine service to support message-level content tagging and add a schema migration for F24 moderation models (MessageContentTag, Report, ModerationAction, User violation tracking).

## Context
- Existing `services/api/src/lib/sightengine.ts` classifies images and stores ContentTag for PostMedia (F05)
- ContentTag model is tied to `postMediaId` (PostMedia) — cannot store tags for Messages
- For F24 moderation we need: tags on messages, Report model, violation tracking on User

## Acceptance Criteria

1. New Prisma migration `20260327000000_f24_content_moderation` adds:
   - `MessageContentTag` model: id, messageId (FK Message), dimension (ContentTagDimension), value String, confidence Float, createdAt
   - `Report` model: id, reporterId (FK User), targetId UUID, targetType (ReportTargetType enum: MESSAGE, POST, PROFILE), category (ReportCategory enum: HARASSMENT, SPAM, UNDERAGE, NON_CONSENSUAL, OTHER), description String?, status (ReportStatus enum: PENDING, REVIEWED, DISMISSED), reviewedBy UUID?, reviewedAt DateTime?, createdAt, updatedAt
   - `ModerationAction` model: id, userId (FK User, target of action), adminId UUID, actionType (ModerationActionType enum: WARNING, TEMP_BAN, PERMANENT_BAN), reason String?, expiresAt DateTime?, createdAt
   - `User.filteredSentCount Int @default(0)` — incremented each time a message from this user is filtered as dick-pic
   - `User.isBanned Boolean @default(false)` and `User.bannedUntil DateTime?` and `User.warningCount Int @default(0)`

2. `services/api/src/lib/sightengine.ts` gains `classifyAndTagMessage(messageId, imageUrl)`:
   - Calls `classifyImage(imageUrl)` (existing)
   - Maps tags to ContentTagDimension values
   - Stores results in `MessageContentTag` via prisma.messageContentTag.createMany()
   - Returns array of stored tags
   - Fire-and-forget wrapper: `classifyMessageAsync(messageId, imageUrl)` (no await, logs errors)

3. A `isDickPic(tags: MessageContentTag[])` utility is exported from `sightengine.ts`:
   - Returns true if any tag has dimension=BODY_PART, value="GENITALS", confidence > 0.3 AND any tag has dimension=NUDITY, value in ["FULL","PARTIAL"]

4. No existing sightengine.ts functionality is broken — `classifyImage`, `classifyAndTagMedia`, `classifyMessageAsync` all still exported

5. Migration is valid SQL (no syntax errors) — uses snake_case column names with `@map()`

## File Paths
- `services/api/prisma/schema.prisma` — add 3 new models + User fields
- `services/api/prisma/migrations/20260327000000_f24_content_moderation/migration.sql` — new migration
- `services/api/src/lib/sightengine.ts` — extend with classifyAndTagMessage, classifyMessageAsync, isDickPic
