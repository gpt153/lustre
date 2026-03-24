# Roadmap: F24-MOD-content-moderation

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Classification & Moderation Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-sightengine-service (sonnet) — Sightengine API integration service: classify image, parse multi-label response, store ContentTag records. Batch and real-time modes.
- wave-1b-dick-pic-filter (haiku) — Filter logic: check content tags for penis-in-focus, check recipient's filter setting, blur image, track filtered count per sender
- wave-1c-reporting-system (haiku) — Prisma: Report (reporterId, targetId, targetType, category, description, status). tRPC: report.create, report.list (admin), report.resolve

### Testgate Wave 1:
- [ ] Image classified via Sightengine
- [ ] Dick-pic filter blurs matching images
- [ ] Reports created and listed

---

## Wave 2: Moderation Tools & Enforcement
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-moderation-queue (haiku) — Admin moderation queue: list reports, view context (message, profile, post), actions (dismiss, warn, temp ban 1/7/30 days, permanent ban)
- wave-2b-auto-enforcement (haiku) — Automated escalation: 3 filtered messages -> warning, 5 -> 7-day ban, 10 -> permanent. Track per-user violation count.

### Testgate Wave 2:
- [ ] Moderation queue displays reports with context
- [ ] Admin actions (warn, ban) execute correctly
- [ ] Auto-enforcement triggers at thresholds
