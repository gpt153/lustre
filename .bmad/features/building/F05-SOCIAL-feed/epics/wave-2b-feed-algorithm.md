# Epic: wave-2b-feed-algorithm

**Model:** sonnet
**Wave:** 2
**Group:** A (parallel with 2a)

## Description

Build the "For You" feed algorithm. SQL-based scoring that ranks posts by: recency decay, interest match (comparing post tags to user preferences), interaction history (show less of "show less"-ed content), and optionally location proximity. Implement as a tRPC procedure that replaces the simple post.list.

## Acceptance Criteria

1. New `post.feed` — protectedProcedure, input: cursor (optional), limit (default 20), returns scored/ranked posts
2. Scoring function in SQL (raw query via Prisma.$queryRaw) with factors: recency (exponential decay, half-life 24h), interest match (tag overlap with user's content filter "allowed" tags = higher score), interaction penalty (posts from "show less" actions get -50% score)
3. New `FeedInteraction` model in schema.prisma: id, userId, postId, type (enum: LIKE, SHOW_LESS), createdAt — with unique constraint on [userId, postId, type]
4. `post.showLess` — protectedProcedure, input: postId, creates SHOW_LESS FeedInteraction
5. `post.like` / `post.unlike` — protectedProcedure, toggle LIKE FeedInteraction
6. Feed query excludes: own posts, deleted posts, posts from blocked users (future-proof with WHERE clause)
7. Returns posts with: media (with tags), author profile (displayName, first photo), likeCount, isLiked (by current user), relevanceScore

## File Paths

- `services/api/prisma/schema.prisma` (add FeedInteraction model + enum)
- `services/api/src/trpc/post-router.ts` (add feed, showLess, like, unlike procedures)
