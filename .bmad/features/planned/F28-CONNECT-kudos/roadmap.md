# Roadmap: F28-CONNECT-kudos

**Status:** PLANNED
**Created:** 2026-03-25
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Badge Catalog & Kudos Backend
**Status:** PLANNED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-kudos-schema (haiku) — Prisma: BadgeCategory, Badge, Kudos, KudosBadge models. Seed script for all MVP badges. Enums for badge categories.
- wave-1b-kudos-api (haiku) — tRPC: kudos.listBadges, kudos.give, kudos.getProfileKudos. Rate limiting (10/24h). Deduplication per interaction. Redis badge catalog cache.

### Testgate Wave 1:
- [ ] Badge catalog seeded and queryable by category
- [ ] Kudos submission stores badge selections for giver->recipient
- [ ] Duplicate kudos for same interaction rejected
- [ ] Rate limit enforced (10 per 24h)
- [ ] SpicyOnly badges excluded when queried in Vanilla mode

---

## Wave 2: AI Badge Selection & Prompt Flow
**Status:** PLANNED

### Parallelization groups:
**Group A (sequential):**
- wave-2a-ai-badge-selector (haiku) — AI service: prompt with free text + available badges -> returns badge_ids. OpenAI GPT-4o-mini. Free text never persisted.
- wave-2b-kudos-trigger (haiku) — Trigger logic: on conversation archive / match end, emit NATS event -> create kudos prompt opportunity. Integration point for SafeDate (F13) when available.

### Testgate Wave 2:
- [ ] AI returns 2-4 valid badge_ids from free text input
- [ ] Free text is not stored in any database table
- [ ] Kudos prompt triggered when conversation is archived
- [ ] Manual badge selection works without AI (skip free text)

---

## Wave 3: Kudos UI & Integrations
**Status:** PLANNED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-kudos-screens-mobile (haiku) — Kudos prompt sheet, badge selection UI (AI-suggested + manual browse), profile kudos display section
- wave-3b-kudos-screens-web (haiku) — Same for web: kudos modal, badge grid, profile kudos tags

**Group B (sequential, after A):**
- wave-3c-integrations (haiku) — Gatekeeper integration: include kudos score in qualification context. Gamification hooks: emit NATS events for kudos milestones (1, 10, 50).

### Testgate Wave 3:
- [ ] Kudos prompt appears after conversation archive on mobile
- [ ] Badge selection UI shows AI suggestions and allows manual browse
- [ ] Profile displays kudos count and top badge tags
- [ ] Spicy badges hidden from Vanilla-mode viewers
- [ ] Gatekeeper receives kudos score in qualification context
