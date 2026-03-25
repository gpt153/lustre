# Roadmap: F08-CONNECT-matching

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Matching Backend
**Status:** DONE
**Started:** 2026-03-25
**Completed:** 2026-03-25

### Epics:
- wave-1a-matching-schema (haiku) — **VERIFIED**
- wave-1b-matching-api (haiku) — **VERIFIED**
- wave-1c-seen-list (haiku) — **VERIFIED**

### Parallelization groups:
**Group A (sequential):**
- wave-1a-matching-schema (haiku) — Prisma: Match, Swipe (userId, targetId, action, timestamp), SeenProfile. PostGIS location queries.
- wave-1b-matching-api (haiku) — tRPC: match.getDiscoveryStack (filtered, excludes seen), match.swipe, match.getMatches, match.search
- wave-1c-seen-list (haiku) — Redis-backed seen list: add on swipe, check on stack generation, TTL 30 days

### Testgate Wave 1:
- [x] Discovery stack returns unseen profiles matching filters — PASS (type-check verified, logic reviewed)
- [x] Swipe creates match on mutual like — PASS (type-check verified, logic reviewed)
- [x] Search returns filtered results with PostGIS distance — PASS (type-check verified, raw SQL for PostGIS)

### Learnings:
- Profile.location is Unsupported() in Prisma — must use raw SQL for location queries
- Pre-existing type errors in wave2.test.ts and wave3.test.ts (not from this feature)

---

## Wave 2: Matching Screens
**Status:** NOT_STARTED

### Epics:
- wave-2a-discover-mobile (haiku) — NOT_STARTED
- wave-2b-discover-web (haiku) — NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-discover-mobile (haiku) — Swipe card UI (rn-swiper-list), match animation, search screen with filters, matches list
- wave-2b-discover-web (haiku) — Grid/card view for web, search with filters, matches list

### Testgate Wave 2:
- [ ] Swipe cards work smoothly on mobile (60 FPS)
- [ ] Mutual match triggers animation and notification
- [ ] Search filters return expected results
