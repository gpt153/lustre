# Roadmap: F29-CONNECT-intentions

**Status:** PLANNED
**Created:** 2026-03-25
**Waves:** 3
**Total epics:** 8

---

## Wave 1: Intention Schema & API
**Status:** PLANNED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-intention-schema (haiku) — Prisma: Intention model with all fields, IntentionStatus enum, IntentionSeeking enum. Relations to User and KinkTag. Expiry field.
- wave-1b-intention-api (haiku) — tRPC: intention.create, intention.update, intention.pause, intention.resume, intention.delete, intention.list. Max 3 active validation. 30-day expiry logic.
- wave-1c-intention-matching (sonnet) — Compatibility scoring engine: formula-based score from field overlap. Redis caching per intention pair. Mutual intention boost. Index intentions in Redis by seeking+gender+location for fast lookup.

### Testgate Wave 1:
- [ ] Intention CRUD works with all fields validated
- [ ] Max 3 active Intentions enforced
- [ ] Expired Intentions excluded from queries
- [ ] Compatibility score computed correctly for overlapping vs non-overlapping Intentions
- [ ] Redis cache stores and retrieves intention matching data

---

## Wave 2: Discovery Feed & Integration
**Status:** PLANNED

### Parallelization groups:
**Group A (sequential):**
- wave-2a-intention-feed (sonnet) — tRPC: intention.getFeed (per-intention result feed). Query: find users with active complementary Intentions, score them, sort by compatibility. Cursor-based pagination. Kvinnor-forst filter enforcement.
- wave-2b-feed-ranking (haiku) — Integrate Gatekeeper score (F07) and Kudos score (F28) into feed ranking. Mutual intention boost logic. Cold-start fallback: show swipe pool profiles when Intention feed has < 5 results.

### Testgate Wave 2:
- [ ] Intention feed returns profiles with matching active Intentions
- [ ] A man only appears in a woman's feed if his Intention matches her criteria
- [ ] Mutual intention overlap boosts ranking
- [ ] Cold-start fallback shows swipe pool profiles
- [ ] Gatekeeper and Kudos scores influence ranking

---

## Wave 3: Intention Screens (Mobile & Web)
**Status:** PLANNED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-intention-screens-mobile (haiku) — Create Intention form screen, Intention list (My Intentions), per-Intention feed screen with intent-first profile cards. Tab integration: Spicy default = Intentions, Vanilla default = swipe.
- wave-3b-intention-screens-web (haiku) — Same for web: create/edit form, Intention dashboard, per-Intention feed page with profile-first cards. Responsive sidebar for active Intentions.

**Group B (sequential, after A):**
- wave-3c-mode-switching (haiku) — Wire up Vanilla/Spicy mode tab switching on discover screen. Spicy: Intentions tab primary, Swipe secondary. Vanilla: Swipe primary, Intentions secondary. Kink fields shown/hidden based on mode.

### Testgate Wave 3:
- [ ] Intention creation form validates and submits all fields
- [ ] Per-Intention feed displays profiles with compatibility score before photo
- [ ] Discover screen defaults to Intentions in Spicy mode, Swipe in Vanilla mode
- [ ] Kink fields hidden in Vanilla mode
- [ ] Intention list shows status (active/paused/expired) with pause/resume controls
