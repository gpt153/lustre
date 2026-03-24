# Epic: wave-2c-kink-tags
**Model:** haiku
**Wave:** 2, Group B (sequential, after A)

## Description
Implement kink tag system with predefined tags in categories, three interest levels, and public/private visibility.

## Acceptance Criteria
1. Seed script that populates 100+ KinkTag records in categories: Bondage, Dominance/Submission, Impact Play, Sensory, Role Play, Fetish, Group, Exhibition/Voyeurism, Other
2. `profile.listKinkTags` publicProcedure — returns all kink tags grouped by category
3. `profile.setKinkTags` protectedProcedure — accepts array of {kinkTagId, interestLevel, isPublic}, upserts ProfileKinkTag records for the user's profile. Replaces all existing tags (delete + insert in transaction).
4. `profile.getMyKinkTags` protectedProcedure — returns user's selected kink tags with interest levels and visibility
5. Public profile view only shows kink tags where isPublic=true
6. Kink tag search: `profile.searchKinkTags` publicProcedure — search by name substring, returns matching tags
7. Interest levels correctly stored: CURIOUS, LIKE, LOVE
8. Validation: max 50 kink tags per profile

## File Paths
1. `services/api/prisma/seed.ts` — new file with kink tag seed data
2. `services/api/src/trpc/kink-router.ts` — new file with kink tag procedures
3. `services/api/src/trpc/router.ts` — register kink router
4. `services/api/package.json` — add prisma seed script to package.json

## Context
- KinkTag and ProfileKinkTag models already in schema from wave-1a
- Use `prisma.$transaction()` for the upsert-all operation in setKinkTags
- Seed script runs via `npx prisma db seed`
- Add `"prisma": { "seed": "tsx prisma/seed.ts" }` to package.json
