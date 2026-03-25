# Epic: wave-1a-group-schema

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — first)

## Description

Add Prisma models for interest groups: Group, GroupMember, GroupModerator. Add enums for group visibility and membership status.

## Acceptance Criteria

1. Enum `GroupVisibility`: OPEN, PRIVATE
2. Enum `MembershipStatus`: PENDING, ACTIVE, BANNED
3. Enum `ModeratorRole`: MODERATOR, OWNER
4. `Group` model with: id (uuid), name (varchar 100), description (varchar 2000), category (varchar 100), visibility (GroupVisibility default OPEN), coverImageUrl (optional), createdById (references User), createdAt, updatedAt
5. `GroupMember` model with: id (uuid), groupId (references Group), userId (references User), status (MembershipStatus default PENDING for private / ACTIVE for open), joinedAt, unique constraint on [groupId, userId]
6. `GroupModerator` model with: id (uuid), groupId (references Group), userId (references User), role (ModeratorRole), assignedAt, unique constraint on [groupId, userId]
7. Relations: User has groupsCreated[], groupMemberships[], groupModerators[]. Group has members[], moderators[], creator relation, posts[] (optional relation to Post)
8. Add `groupId` optional field to Post model (references Group) for group posts
9. All models use @@map with snake_case table names
10. Generate a migration with `npx prisma migrate dev --name add_groups`

## File Paths

- `services/api/prisma/schema.prisma`
