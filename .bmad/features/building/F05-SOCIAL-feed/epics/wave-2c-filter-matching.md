# Epic: wave-2c-filter-matching

**Model:** haiku
**Wave:** 2
**Group:** B (sequential, after A)

## Description

Integrate content filter matching into the feed algorithm. The feed query must exclude posts whose content tags conflict with the user's content filter settings.

## Acceptance Criteria

1. Feed query (post.feed) now loads the user's UserContentFilter before querying
2. Posts are excluded if ANY of their media has tags that fall outside the user's allowed values for that dimension
3. Example: if user's nudityLevel filter is [NONE, IMPLIED], posts with any media tagged PARTIAL or FULL nudity are excluded
4. Filter matching done in SQL WHERE clause for efficiency (not post-fetch filtering)
5. If user has no content filter, apply SOFT preset defaults
6. Feed still works correctly when posts have no tags (unclassified posts shown to all)

## File Paths

- `services/api/src/trpc/post-router.ts` (modify feed procedure to include filter matching)
