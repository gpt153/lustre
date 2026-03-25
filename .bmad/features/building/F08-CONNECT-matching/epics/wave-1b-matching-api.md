# Epic: wave-1b-matching-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — depends on 1a)

## Description

Create the tRPC match router with discovery stack, swipe, matches list, and search endpoints. Register it in the app router.

## Acceptance Criteria

1. File `services/api/src/trpc/match-router.ts` exists with a `matchRouter` exported
2. `match.getDiscoveryStack` — protectedProcedure query that takes `{ limit?: number }` (default 20). Returns profiles the user has NOT swiped on and NOT in SeenProfile. Excludes the user's own profile. Includes photos (public, ordered by position) and basic profile fields. Orders by most recent profiles first.
3. `match.swipe` — protectedProcedure mutation taking `{ targetId: string, action: SwipeAction }`. Creates a Swipe record. Creates a SeenProfile record. If action is LIKE, checks if target has also liked the user — if so, creates a Match and returns `{ matched: true, matchId }`. Otherwise returns `{ matched: false }`.
4. `match.getMatches` — protectedProcedure query returning all matches for the user with the matched user's profile (displayName, photos, age, bio). Ordered by most recent match first.
5. `match.search` — protectedProcedure query taking `{ gender?: Gender[], orientation?: Orientation[], ageMin?: number, ageMax?: number, seeking?: Seeking[], radiusKm?: number }`. Filters profiles using Prisma where clauses. For radiusKm, uses raw SQL with `ST_DWithin` on the profile location field. Returns paginated results with cursor.
6. Router registered in `services/api/src/trpc/router.ts` as `match: matchRouter`
7. All inputs validated with Zod schemas
8. All procedures use `protectedProcedure` (auth required)

## File Paths

- `services/api/src/trpc/match-router.ts` (new)
- `services/api/src/trpc/router.ts` (edit — add import + register)
