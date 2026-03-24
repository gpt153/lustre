# Epic: wave-1b-profile-crud-api
**Model:** haiku
**Wave:** 1, Group A (second, depends on wave-1a)

## Description
Create tRPC procedures for profile CRUD: create, update, get (own), getPublic (other user). Input validation with Zod schemas.

## Acceptance Criteria
1. `profile.create` protectedProcedure — creates a Profile for the authenticated user with required fields (displayName, age, gender, orientation, contentPreference) and optional fields (bio, relationshipType, seeking as array). Returns the created profile.
2. `profile.update` protectedProcedure — updates the user's own profile. Only allows updating fields the user owns. Returns updated profile.
3. `profile.get` protectedProcedure — returns the full profile for the authenticated user, including photos and kink tags with interest levels.
4. `profile.getPublic` publicProcedure — returns a public profile by userId. Excludes: contentPreference. Excludes kink tags where isPublic=false. Includes photos where isPublic=true.
5. Zod input schemas for create and update with proper validation (age 18-99, displayName 2-50 chars, bio max 2000 chars).
6. Error handling: 404 if profile not found, 409 if profile already exists on create, 403 if trying to update another user's profile.
7. Profile router registered in the main appRouter.
8. Seeking stored as an array of Seeking enum values on the Profile model (add `seeking Seeking[]` to schema if not present).

## File Paths
1. `services/api/src/trpc/profile-router.ts` — new file with profile CRUD procedures
2. `services/api/src/trpc/router.ts` — register profile router
3. `packages/api/src/schemas/profile.ts` — new file with shared Zod schemas for profile
4. `services/api/prisma/schema.prisma` — add `seeking Seeking[]` if needed

## Context
- Follow existing patterns from `user-router.ts` and `router.ts`
- Import `router, publicProcedure, protectedProcedure` from `./middleware.js`
- ctx has: prisma, redis, userId, sessionId
- Use superjson transformer (already configured)
- Zod is already a dependency
- The profile includes relations: photos (ProfilePhoto[]), kinkTags (ProfileKinkTag[] with include KinkTag)
