# Epic: wave-1b-kudos-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — depends on 1a)

## Description

Create the tRPC router for the kudos system. Endpoints: list badges by category (with Spicy filtering), give kudos (with deduplication + rate limiting), get kudos summary for a profile. Badge catalog cached in Redis with TTL invalidation.

## Acceptance Criteria

1. tRPC router `kudos` registered in `services/api/src/trpc/router.ts` with procedures: `listBadges`, `give`, `getProfileKudos`.
2. `kudos.listBadges` accepts optional `categorySlug` filter. When caller is in Vanilla mode (determined from profile's contentPreference), badges with `spicyOnly=true` are excluded. Returns badges grouped by category.
3. `kudos.give` accepts `{ recipientId, matchId?, badgeIds: string[] }`. Validates: (a) caller is not recipient, (b) no existing Kudos for this giverId+recipientId+matchId combo, (c) max 10 kudos submissions per caller in 24h window, (d) 1-6 badgeIds provided, (e) all badgeIds exist and are valid for caller's mode.
4. `kudos.getProfileKudos` accepts `{ userId }`. Returns `{ totalCount, badges: [{ badgeId, name, category, count }] }` sorted by count descending. Filters out spicyOnly badges if caller is in Vanilla mode.
5. Badge catalog cached in Redis key `badges:catalog` with 1-hour TTL. Cache invalidated on badge catalog changes.
6. Rate limiting uses Redis key `kudos:ratelimit:{userId}` with 24h TTL and INCR.
7. All inputs validated with Zod schemas.

## File Paths

- `services/api/src/trpc/kudos-router.ts`
- `services/api/src/trpc/router.ts` (register new router)
- `services/api/src/lib/kudos.ts` (badge cache + rate limit helpers)
- `services/api/src/__tests__/kudos.test.ts`
