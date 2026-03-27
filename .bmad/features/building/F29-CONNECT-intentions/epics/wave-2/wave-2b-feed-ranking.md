# Epic: wave-2b-feed-ranking

**Model:** haiku
**Wave:** 2
**Group:** A (sequential — depends on 2a)

## Description

Enhance the Intention feed ranking by integrating Gatekeeper score (F07) and Kudos score (F28) as ranking signals. Implement the cold-start fallback: when an Intention feed has fewer than 5 results, supplement with profiles from the general swipe pool (F08) that match the Intention's basic criteria.

## Acceptance Criteria

1. Feed ranking formula updated in `intention-scoring.ts`: `finalScore = intentionScore * 0.7 + gatekeeperPassRate * 0.15 + kudosScore * 0.15`.
2. `gatekeeperPassRate` sourced from user's historical gatekeeper pass percentage (0-100). Default 50 for users with no gatekeeper history.
3. `kudosScore` sourced from `getKudosScore(userId)` from F28 (0-100). Default 0 for users with no kudos.
4. Cold-start fallback: when `intention.getFeed` returns < 5 results, supplement with profiles from `match.getDiscoveryStack` (F08) filtered by the Intention's genderPreferences, ageRange, and distanceRadius. These supplemental results are marked with `isFallback: true`.
5. Fallback profiles do NOT count toward pagination — they are appended after intention-matched results.
6. Ranking factors are configurable via constants in `intention-scoring.ts` (weights can be tuned without code changes to the algorithm).

## File Paths

- `services/api/src/lib/intention-scoring.ts` (update ranking formula)
- `services/api/src/lib/intention-feed.ts` (add cold-start fallback)
- `services/api/src/lib/kudos.ts` (import getKudosScore)
- `services/api/src/__tests__/intention-ranking.test.ts`
