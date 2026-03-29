# Epic: wave-1b-spicy-level-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — after 1a)

## Description

tRPC procedures for spicy-level filter management, updated post creation with type and spicy level, and feed query updated to filter by viewer's active spicy levels. Vibe auto-expiry via scheduled cleanup.

## Acceptance Criteria

1. New tRPC router `spicyFilter` with procedures:
   - `get` (query): returns user's SpicyLevelFilter (4 booleans)
   - `update` (mutation): sets all 4 booleans, validates at least 1 is true
   - `quickToggle` (mutation): toggles a single level on/off, validates at least 1 remains true after toggle
2. `post.create` mutation updated:
   - Accepts `postType` (MOMENT | VIBE | PROMPT_RESPONSE) and `spicyLevel` (VANILLA | SULTRY | STEAMY | EXPLICIT)
   - VIBE type: auto-sets `expiresAt` to now + 24 hours
   - PROMPT_RESPONSE type: requires `promptId`, validates prompt exists
3. `post.feed` query updated:
   - Fetches viewer's SpicyLevelFilter
   - Filters posts: only show posts where `post.spicyLevel` matches one of viewer's active levels
   - Replaces old ContentPreference-based filtering
4. `post.list` (profile gallery) updated:
   - Excludes VIBE type posts (vibes don't appear on profile)
   - Respects viewer's spicy-level filter (blurred placeholder for content above level)
5. Vibe cleanup: utility function `deleteExpiredVibes()` that deletes posts where `postType = VIBE AND expiresAt < now()`, including R2 media cleanup
6. Cron endpoint or NATS scheduled job to run `deleteExpiredVibes()` hourly

## File Paths

- `services/api/src/trpc/spicy-filter-router.ts` (new)
- `services/api/src/trpc/post-router.ts` (update)
- `services/api/src/trpc/router.ts` (register new router)
- `services/api/src/lib/vibe-cleanup.ts` (new)
