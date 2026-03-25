# Epic: wave-1c-group-moderation

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — third, depends on 1b)

## Description

Add moderation endpoints: ban member, unban, remove post from group, edit group settings, add/remove moderator.

## Acceptance Criteria

1. `group.ban` — protectedProcedure, input: groupId, userId. Moderator/Owner only. Sets member status to BANNED. Cannot ban other moderators (only OWNER can).
2. `group.unban` — protectedProcedure, input: groupId, userId. Moderator/Owner only. Deletes BANNED membership record so user can rejoin.
3. `group.removePost` — protectedProcedure, input: groupId, postId. Moderator/Owner only. Sets post's groupId to null (removes from group feed without deleting).
4. `group.update` — protectedProcedure, input: groupId, optional name/description/category/visibility/coverImageUrl. Owner only. Updates group settings.
5. `group.addModerator` — protectedProcedure, input: groupId, userId. Owner only. Creates GroupModerator record with MODERATOR role. User must be ACTIVE member.
6. `group.removeModerator` — protectedProcedure, input: groupId, userId. Owner only. Deletes GroupModerator record. Cannot remove self as OWNER.
7. `group.pendingMembers` — protectedProcedure, input: groupId. Moderator/Owner only. Returns members with PENDING status.
8. Helper function `assertGroupModerator(prisma, groupId, userId)` that throws FORBIDDEN if user is not a moderator/owner of the group.

## File Paths

- `services/api/src/trpc/group-router.ts`
