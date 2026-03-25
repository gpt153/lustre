# Epic: wave-1b-org-api
**Model:** haiku
**Wave:** 1 / Group A sequential (depends on wave-1a being merged)

## Goal
Create the tRPC `org` router with full CRUD + member management + verification request. Register it on appRouter.

## Files to create/modify
1. `services/api/src/trpc/org-router.ts` — new file
2. `services/api/src/trpc/router.ts` — add `org: orgRouter`

## Acceptance Criteria
1. `org-router.ts` exports `orgRouter` using `router` from `./middleware.js`
2. `org.create` — protectedProcedure, input: {name, description?, type, locationName?, contactEmail?, contactPhone?, websiteUrl?}, creates Organization + OrgMember(role=OWNER) in a transaction, returns org
3. `org.get` — protectedProcedure, input: {orgId: uuid}, returns org with _count.members, isMember bool, memberRole string|null, throws NOT_FOUND if missing
4. `org.list` — protectedProcedure, cursor-based pagination (limit default 20 max 50), returns {orgs, nextCursor}
5. `org.update` — protectedProcedure, input: {orgId, name?, description?, locationName?, contactEmail?, contactPhone?, websiteUrl?, coverImageUrl?}, requires OWNER or ADMIN role, throws FORBIDDEN otherwise
6. `org.getMembers` — protectedProcedure, input: {orgId, cursor?, limit?}, returns paginated members with user.id and user.displayName
7. `org.addMember` — protectedProcedure, input: {orgId, userId}, requires caller to be OWNER or ADMIN, creates OrgMember(role=MEMBER), throws CONFLICT if already member
8. `org.removeMember` — protectedProcedure, input: {orgId, userId}, requires OWNER or ADMIN (can't remove OWNER), deletes OrgMember
9. `org.join` — protectedProcedure, input: {orgId}, creates OrgMember(role=MEMBER) for ctx.userId, throws CONFLICT if already member
10. `org.leave` — protectedProcedure, input: {orgId}, deletes OrgMember for ctx.userId, throws BAD_REQUEST if user is OWNER
11. `org.requestVerification` — protectedProcedure, input: {orgId}, requires OWNER role, creates OrgVerification(status=PENDING) if none exists, throws CONFLICT if already requested
12. `router.ts` imports orgRouter and adds `org: orgRouter` to appRouter

## Context
- Import pattern: `import { z } from 'zod'`, `import { TRPCError } from '@trpc/server'`, `import { router, protectedProcedure } from './middleware.js'`
- ctx.userId is the authenticated user ID
- ctx.prisma is the Prisma client
- Follow exact patterns from `services/api/src/trpc/group-router.ts`
- Helper function `assertOrgAdmin(prisma, orgId, userId)` should check OrgMember role is OWNER or ADMIN
- Prisma models: Organization, OrgMember, OrgVerification (from wave-1a schema)
- READ router.ts before editing it to avoid breaking existing imports
