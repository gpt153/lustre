# Epic: wave-1b-group-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — second, depends on 1a)

## Description

Create tRPC router for group CRUD operations: create, get, list, search, join, leave, approve/reject membership, list members.

## Acceptance Criteria

1. `group.create` — protectedProcedure, input: name, description, category, visibility. Creates group + adds creator as OWNER moderator + ACTIVE member. Returns group.
2. `group.get` — protectedProcedure, input: groupId. Returns group with member count and whether current user is a member/moderator.
3. `group.list` — protectedProcedure, cursor-based pagination (limit default 20). Returns groups ordered by createdAt desc.
4. `group.search` — protectedProcedure, input: query string. Searches groups by name/description using SQL ILIKE.
5. `group.join` — protectedProcedure, input: groupId. For OPEN groups: creates ACTIVE membership. For PRIVATE: creates PENDING membership. Throws if already member or banned.
6. `group.leave` — protectedProcedure, input: groupId. Deletes membership. Throws if user is OWNER (must transfer ownership first).
7. `group.approve` — protectedProcedure, input: groupId, userId. Moderator/Owner only. Changes PENDING membership to ACTIVE.
8. `group.reject` — protectedProcedure, input: groupId, userId. Moderator/Owner only. Deletes PENDING membership.
9. `group.members` — protectedProcedure, input: groupId, cursor-based pagination. Returns members with status ACTIVE.
10. Register groupRouter in the main appRouter.

## File Paths

- `services/api/src/trpc/group-router.ts` (new)
- `services/api/src/trpc/router.ts`
