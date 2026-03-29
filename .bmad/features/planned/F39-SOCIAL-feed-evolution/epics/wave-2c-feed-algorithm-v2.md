# Epic: wave-2c-feed-algorithm-v2

**Model:** sonnet
**Wave:** 2
**Group:** B (sequential — after A)

## Description

Upgrade the feed ranking algorithm from simple recency decay to a multi-factor scoring system incorporating proximity, interest compatibility, trust score, spotlight, and new-account dampening.

## Acceptance Criteria

1. Feed scoring formula (normalized 0-100):
   - **Recency** (weight 0.25): exponential decay, 24h half-life (existing)
   - **Proximity** (weight 0.20): PostGIS ST_DWithin on author's profile.location. Same city = full score, < 50km = 0.7, < 200km = 0.3, > 200km = 0.1
   - **Interest compatibility** (weight 0.15): overlap between viewer's profile tags (orientation, seeking, kink tags) and author's profile tags
   - **Trust score** (weight 0.15): F35 ProfileTrustScore (0-100), fetched from Redis cache. Higher trust = more feed impressions
   - **Engagement quality** (weight 0.10): posts with diverse reaction types (HOT + CRUSH vs only HOT) rank higher
   - **Content freshness** (weight 0.15): VIBE posts boosted in first 6h, PROMPT_RESPONSE boosted in first 6h on day of prompt
2. Spotlight boost (F35): if author has active Spotlight, add +30 to raw score (before normalization), capped at 100
3. New-account dampening: accounts < 14 days old have their post's reach multiplied by `min(1.0, accountAgeDays / 14)` — ramps linearly from 0 to full reach
4. Show-less penalty: maintained from F05 (50% score reduction for flagged post patterns)
5. Ad injection: maintained at position 5 (existing from F22)
6. Cursor-based pagination maintained — scoring applied as ORDER BY clause
7. Redis pipeline for batch-fetching trust scores + spotlight status (avoid N+1 queries)

## File Paths

- `services/api/src/trpc/post-router.ts` (rewrite feed query)
- `services/api/src/lib/feed-scoring.ts` (new — scoring engine extracted from router)
