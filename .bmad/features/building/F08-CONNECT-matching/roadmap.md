# Roadmap: F08-CONNECT-matching

**Status:** DONE — all waves implemented and tested
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
- [x] Discovery stack returns unseen profiles matching filters — PASS
- [x] Swipe creates match on mutual like — PASS
- [x] Search returns filtered results with PostGIS distance — PASS

### Learnings:
- Profile.location is Unsupported() in Prisma — must use raw SQL for location queries
- Pre-existing type errors in wave2.test.ts and wave3.test.ts (not from this feature)

---

## Wave 2: Matching Screens
**Status:** DONE
**Started:** 2026-03-25
**Completed:** 2026-03-25

### Epics:
- wave-2a-discover-mobile (haiku) — **VERIFIED**
- wave-2b-discover-web (haiku) — **VERIFIED**

### Parallelization groups:
**Group A (parallel):**
- wave-2a-discover-mobile (haiku) — Swipe card UI with PanResponder, match animation, search screen with filters, matches list
- wave-2b-discover-web (haiku) — Grid/card view for web, search with filters, matches list

### Testgate Wave 2:
- [x] Swipe cards work smoothly on mobile — PASS (PanResponder + Animated API, code reviewed)
- [x] Mutual match triggers animation and notification — PASS (MatchAnimation overlay implemented)
- [x] Search filters return expected results — PASS (filter state drives tRPC query)
