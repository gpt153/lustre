# Epic: wave-2a-reactions-system

**Model:** haiku
**Wave:** 2
**Group:** A (parallel)

## Description

Replace the single LIKE interaction with multiple reaction types. Reaction counts visible to post author only — never publicly displayed.

## Acceptance Criteria

1. Update `FeedInteractionType` enum: replace `LIKE` with `HOT`, `CRUSH`, `WOULD_HANG` (keep `SHOW_LESS`)
2. Unique constraint: one reaction type per user per post (user can have HOT on one post and CRUSH on another, but only one reaction type per post)
3. tRPC procedures:
   - `post.react` (mutation): input `{ postId, type: HOT | CRUSH | WOULD_HANG }`. Upserts — if user already reacted with different type, replaces it
   - `post.unreact` (mutation): input `{ postId }`. Removes user's reaction
   - `post.getReactions` (query): input `{ postId }`. Returns aggregated counts `{ hot: number, crush: number, wouldHang: number, total: number }`. Only accessible by post author (throw FORBIDDEN for non-authors)
4. `post.feed` response includes `myReaction: HOT | CRUSH | WOULD_HANG | null` for the viewing user
5. NATS event `lustre.post.reaction` emitted on react (for future notification system)
6. Migration handles existing LIKE interactions: map LIKE → HOT

## File Paths

- `services/api/prisma/schema.prisma` (update enum)
- `services/api/prisma/migrations/[timestamp]_f39_reactions/migration.sql`
- `services/api/src/trpc/post-router.ts` (update)
