# Test Spec: F28-CONNECT-kudos

## Wave 1 Tests

### T1: Badge catalog seeded and queryable
- Run badge seed script
- Call `kudos.listBadges` — verify 5 categories returned with ~24 total badges
- Call `kudos.listBadges` with `categorySlug: "kommunikation"` — verify 6 badges returned
- As Vanilla-mode user, call `kudos.listBadges` — verify Spicy category badges excluded

### T2: Kudos submission with deduplication
- User A gives kudos to User B with 3 badgeIds for matchId X — returns success
- User A attempts kudos to User B for same matchId X again — returns error (duplicate)
- User A gives kudos to User B for different matchId Y — returns success
- Verify KudosBadge records created for each badge selected

### T3: Rate limiting enforced
- User A submits 10 kudos to 10 different recipients — all succeed
- User A attempts 11th kudos — returns rate limit error
- Wait for TTL expiry (or manually clear Redis key) — next kudos succeeds

### T4: Profile kudos aggregation
- User B receives kudos from 3 different users with overlapping badges
- Call `kudos.getProfileKudos({ userId: B })` — verify totalCount = 3
- Verify badge counts aggregated correctly (e.g., "Respekterar granser" x 2)
- Verify badges sorted by count descending

## Wave 2 Tests

### T5: AI badge suggestion from free text
- Call `kudos.suggestBadges({ freeText: "Han var trevlig och respekterade mina granser" })`
- Verify 2-4 badge IDs returned, all valid in the badge catalog
- Verify the freeText does NOT appear in any database table
- Call with empty freeText — verify error or empty response

### T6: Kudos prompt triggered on conversation archive
- Create a match between User A and User B
- Archive the conversation
- Verify KudosPrompt records created for both users (PENDING status)
- Call `kudos.getPendingPrompts` as User A — verify prompt for User B exists
- Call `kudos.dismissPrompt` — verify status changes to DISMISSED

### T7: Prompt lifecycle
- Create a KudosPrompt with expiresAt in the past
- Call `kudos.getPendingPrompts` — verify expired prompt is NOT returned
- Complete a kudos via `kudos.give` — verify corresponding prompt set to COMPLETED

## Wave 3 Tests

### T8: Spicy badge visibility
- User B has received Spicy badges ("Respekterar safeword" x 3)
- As Spicy-mode viewer, view User B's profile kudos — Spicy badges visible
- As Vanilla-mode viewer, view User B's profile kudos — Spicy badges hidden, totalCount adjusted

### T9: Gatekeeper integration
- User with 60 kudos (score > 50) initiates gatekeeper conversation
- Verify gatekeeper AI system prompt includes "trusted community member" context
- Verify `gatekeeper.checkRequired` response includes kudosScore field

### T10: Gamification milestone events
- User receives 1st kudos — verify NATS event `kudos.milestone.first` emitted
- User receives 10th kudos — verify NATS event `kudos.milestone.10` emitted
- User receives 10th kudos again (idempotency) — verify NO duplicate event emitted
