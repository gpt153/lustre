# Epic: wave-2a-intention-feed

**Model:** sonnet
**Wave:** 2
**Group:** A (sequential — must complete before 2b)

## Description

Build the per-Intention discovery feed. Given a user's active Intention, query Redis indexes to find users with complementary active Intentions, score them, and return a paginated feed. Enforce the "Kvinnor forst" principle: a man only appears in a woman's feed if his Intention genuinely matches her criteria. Cursor-based pagination with 20 results per page.

## Acceptance Criteria

1. tRPC procedure `intention.getFeed` accepts `{ intentionId, cursor?, limit? }` and returns `{ results: IntentionFeedItem[], nextCursor }`.
2. `IntentionFeedItem` contains: userId, displayName, compatibilityScore (0-100), matchedIntentionTags (string[]), bioSnippet (first 100 chars), photoUrl (first photo), intentionSeeking, distance (km).
3. Feed query pipeline: (a) lookup Redis index for active Intentions matching source Intention's seeking/gender criteria, (b) filter by age range overlap and distance, (c) score remaining candidates, (d) sort by score descending, (e) paginate.
4. Kvinnor-forst enforcement: when the querying user is female-presenting, male profiles are only included if the male user has an active Intention whose genderPreferences include the woman's gender AND whose seeking matches her Intention's seeking value.
5. Profiles already swiped/passed by the user (from F08 seen-list) are excluded from feed results.
6. Feed results cached per Intention in Redis with 15-minute TTL, invalidated on Intention changes.
7. Cursor-based pagination using score+id composite cursor for stable ordering.

## File Paths

- `services/api/src/trpc/intention-router.ts` (add getFeed procedure)
- `services/api/src/lib/intention-feed.ts`
- `services/api/src/lib/seen-list.ts` (reuse existing for feed exclusion)
- `services/api/src/__tests__/intention-feed.test.ts`
