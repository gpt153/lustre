# Epic: wave-1c-intention-matching

**Model:** sonnet
**Wave:** 1
**Group:** A (sequential — depends on 1b)

## Description

Build the compatibility scoring engine for Intentions. Given two Intentions (or an Intention and a profile), compute a 0-100 compatibility score based on field overlap. Cache scores in Redis. Index active Intentions in Redis by seeking+gender+location for fast lookup during feed generation. Implement the mutual intention boost.

## Acceptance Criteria

1. Scoring function `computeIntentionScore(intentionA, intentionB, profileA, profileB): number` in `services/api/src/lib/intention-scoring.ts` returns 0-100.
2. Score components weighted: seeking match (25%), gender/orientation alignment (20%), age range overlap (15%), distance proximity (15%), availability overlap (10%), kink overlap in Spicy mode (15% — redistributed to other factors in Vanilla).
3. Mutual intention boost: when both users have active Intentions with complementary seeking values (e.g., both seeking CASUAL), score gets a 1.2x multiplier (capped at 100).
4. Redis index: active Intentions indexed in sorted sets keyed by `intentions:seeking:{seekingType}:gender:{gender}` with score = expiresAt timestamp. Enables fast lookup of "all active Intentions seeking X from gender Y".
5. Scored pairs cached in Redis key `intention:score:{intentionIdA}:{intentionIdB}` with 6-hour TTL.
6. Index updated on Intention create/update/pause/resume/delete/expire via helper functions.
7. Batch scoring function `scoreIntentionsForFeed(sourceIntention, candidateIntentions[]): ScoredResult[]` returns sorted array of {intentionId, userId, score, matchedTags[]}.

## File Paths

- `services/api/src/lib/intention-scoring.ts`
- `services/api/src/lib/intention-index.ts`
- `services/api/src/__tests__/intention-scoring.test.ts`
