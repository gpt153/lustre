# Roadmap: F28-CONNECT-kudos

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-25
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Badge Catalog & Kudos Backend
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26

### Epic Status:
- wave-1a-kudos-schema: VERIFIED
- wave-1b-kudos-api: VERIFIED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-kudos-schema (haiku) — Prisma: BadgeCategory, Badge, Kudos, KudosBadge models. Seed script for all MVP badges. Enums for badge categories.
- wave-1b-kudos-api (haiku) — tRPC: kudos.listBadges, kudos.give, kudos.getProfileKudos. Rate limiting (10/24h). Deduplication per interaction. Redis badge catalog cache.

### Testgate Wave 1:
- [x] Badge catalog seeded and queryable by category — PASS
- [x] Kudos submission stores badge selections for giver->recipient — PASS
- [x] Duplicate kudos for same interaction rejected — PASS
- [x] Rate limit enforced (10 per 24h) — PASS
- [x] SpicyOnly badges excluded when queried in Vanilla mode — PASS

### Learnings:
- Used KudosBadge/KudosBadgeCategory naming to avoid conflict with existing F18 gamification Badge model

---

## Wave 2: AI Badge Selection & Prompt Flow
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26

### Epic Status:
- wave-2a-ai-badge-selector: VERIFIED
- wave-2b-kudos-trigger: VERIFIED

### Parallelization groups:
**Group A (sequential):**
- wave-2a-ai-badge-selector (haiku) — AI service: prompt with free text + available badges -> returns badge_ids. OpenAI GPT-4o-mini. Free text never persisted.
- wave-2b-kudos-trigger (haiku) — Trigger logic: on conversation archive / match end, emit NATS event -> create kudos prompt opportunity. Integration point for SafeDate (F13) when available.

### Testgate Wave 2:
- [x] AI returns 2-4 valid badge_ids from free text input — PASS
- [x] Free text is not stored in any database table — PASS
- [x] Kudos prompt triggered when conversation is archived — PASS
- [x] Manual badge selection works without AI (skip free text) — PASS

---

## Wave 3: Kudos UI & Integrations
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26

### Epic Status:
- wave-3a-kudos-screens-mobile: VERIFIED
- wave-3b-kudos-screens-web: VERIFIED
- wave-3c-integrations: VERIFIED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-kudos-screens-mobile (haiku) — Kudos prompt sheet, badge selection UI (AI-suggested + manual browse), profile kudos display section
- wave-3b-kudos-screens-web (haiku) — Same for web: kudos modal, badge grid, profile kudos tags

**Group B (sequential, after A):**
- wave-3c-integrations (haiku) — Gatekeeper integration: include kudos score in qualification context. Gamification hooks: emit NATS events for kudos milestones (1, 10, 50).

### Testgate Wave 3:
- [x] Kudos prompt appears after conversation archive on mobile — PASS
- [x] Badge selection UI shows AI suggestions and allows manual browse — PASS
- [x] Profile displays kudos count and top badge tags — PASS
- [x] Spicy badges hidden from Vanilla-mode viewers — PASS
- [x] Gatekeeper receives kudos score in qualification context — PASS
