# Test Spec: F29-CONNECT-intentions

## Wave 1 Tests

### T1: Intention CRUD operations
- Create an Intention with all fields — verify stored correctly with ACTIVE status and expiresAt = now + 30 days
- Update seeking and ageRange — verify fields updated, other fields unchanged
- Pause an Intention — verify status changes to PAUSED
- Resume a paused Intention — verify status changes back to ACTIVE
- Delete an Intention — verify status changes to DELETED, excluded from list queries

### T2: Max 3 active Intentions enforced
- Create 3 Intentions — all succeed
- Attempt to create 4th — returns error with message about max limit
- Pause one Intention — attempt to create 4th — succeeds (only 2 active + 1 paused)
- Delete one — attempt another — succeeds

### T3: Expiry logic
- Create Intention with expiresAt manually set to 1 hour ago
- Call `intention.list` — verify the expired Intention has status EXPIRED
- Attempt to resume the expired Intention — returns error
- Create new Intention — verify expiresAt is 30 days from now

### T4: Compatibility scoring
- Create Intention A: seeking CASUAL, gender [WOMAN], age 25-35, distance 50km
- Create Intention B: seeking CASUAL, gender [MAN], age 28-40, distance 50km (complementary)
- Score A vs B — verify score > 70 (high overlap)
- Create Intention C: seeking RELATIONSHIP, gender [WOMAN], age 45-55, distance 10km
- Score A vs C — verify score < 30 (low overlap)
- Verify mutual boost: A+B score with boost > A+B score without boost

### T5: Redis intention indexing
- Create 3 Intentions with different seeking values
- Query Redis index `intentions:seeking:CASUAL:gender:WOMAN` — verify correct Intentions indexed
- Pause one Intention — verify it is removed from Redis index
- Resume it — verify it reappears in index

## Wave 2 Tests

### T6: Intention feed returns matching profiles
- User A (woman) creates Intention: seeking CASUAL, gender [MAN], age 25-35
- User B (man) creates Intention: seeking CASUAL, gender [WOMAN], age 25-35
- User C (man) has NO active Intention
- Call `intention.getFeed` for User A's Intention — verify User B appears, User C does NOT
- Verify result contains compatibilityScore, matchedIntentionTags, bioSnippet

### T7: Kvinnor-forst enforcement
- User A (woman) creates Intention: seeking RELATIONSHIP, gender [MAN]
- User B (man) creates Intention: seeking CASUAL, gender [WOMAN] (different seeking)
- User C (man) creates Intention: seeking RELATIONSHIP, gender [WOMAN] (matching seeking)
- Call `intention.getFeed` for User A — verify User C appears but User B does NOT

### T8: Feed excludes seen/swiped profiles
- User A creates Intention, User B has matching Intention
- User A swipes PASS on User B (via F08 swipe system)
- Call `intention.getFeed` for User A — verify User B is excluded

### T9: Cold-start fallback
- User A creates Intention but no other users have matching Intentions
- Call `intention.getFeed` — verify fallback profiles from swipe pool returned with `isFallback: true`
- Verify fallback profiles match basic Intention criteria (gender, age range)

### T10: Ranking integration
- User B has kudosScore 80 and gatekeeperPassRate 90
- User C has kudosScore 10 and gatekeeperPassRate 40
- Both have identical intention match with User A
- Call `intention.getFeed` for User A — verify User B ranked above User C

## Wave 3 Tests

### T11: Mode-aware tab defaults
- In Spicy mode, open Discover screen — verify Intentions sub-tab is selected by default
- In Vanilla mode, open Discover screen — verify Swipe sub-tab is selected by default
- Switch from Vanilla to Spicy in settings — return to Discover — verify Intentions now default

### T12: Kink field visibility
- In Spicy mode, open Create Intention form — verify kink multi-select field is visible
- In Vanilla mode, open Create Intention form — verify kink field is completely hidden
- Create Intention with kinks in Spicy mode — switch to Vanilla — edit Intention — verify kinks preserved but field hidden

### T13: Intent-first profile cards
- View Intention feed — verify each card shows: compatibility score, matched tags, bio snippet ABOVE the profile photo
- Tap on a card — verify full profile expands with photo prominent
- Verify fallback profiles show "Suggested" label
