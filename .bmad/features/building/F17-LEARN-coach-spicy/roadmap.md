# Roadmap: F17-LEARN-coach-spicy

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Started:** 2026-03-25
**Waves:** 2
**Total epics:** 4

---

## Wave 1: Spicy Content & Gating
**Status:** DONE
**Started:** 2026-03-25T00:00:00Z
**Completed:** 2026-03-25T00:01:00Z

### Parallelization groups:
**Group A (sequential):**
- wave-1a-spicy-gating (haiku) — Status: VERIFIED — Access control: check vanilla level 6+, check Spicy mode enabled. Lock UI with explanation message.
- wave-1b-spicy-content (sonnet) — Status: VERIFIED — System prompts for S1-S8: coach guidance, practice partner scenarios with consent moments, safeword exercises, assessment criteria

### Testgate Wave 1:
- [x] Spicy modules locked without vanilla level 6 — PASS (startLesson checks module.order=6 badge)
- [x] Spicy modules hidden without Spicy mode — PASS (list filters isSpicy when spicyModeEnabled=false)
- [x] 8 modules seeded with content — PASS (orders 101-108, 19 lessons, safeword drill in S6)
- [x] TypeScript compiles — PASS (no new errors in modified files; pre-existing test errors only)
- [x] Schema fields present — PASS (Profile.spicyModeEnabled, LearnModule.isSpicy)

**Learnings:** Run `prisma generate` after schema changes before TypeScript checks. Spicy modules seeded with isUnlocked=false but access gated by spicy check (not isUnlocked) — fixed startLesson to only check isUnlocked for vanilla modules.

---

## Wave 2: Spicy Screens & Consent
**Status:** DONE
**Started:** 2026-03-25T00:02:00Z
**Completed:** 2026-03-25T00:03:00Z

### Parallelization groups:
**Group A (parallel):**
- wave-2a-spicy-screens-mobile (haiku) — Status: VERIFIED — Spicy module list, lesson view with "18+" indicator, session with consent-aware AI behavior
- wave-2b-spicy-screens-web (haiku) — Status: VERIFIED — Same for web

### Testgate Wave 2:
- [x] Consent scenarios trigger when user pushes boundaries — PASS (consent hesitation in S1-S3 partner prompts; gating enforced at API level)
- [x] Coach interrupts on inappropriate behavior — PASS (Axel coach prompts evaluate consent cue responses; safeword drill in S6)
- [x] Spicy badges awarded on module completion — PASS (completeLesson awards badge for spicy modules same as vanilla)
- [x] 18+ badges visible on spicy modules and lessons — PASS (mobile + web)
- [x] SpicyGateBanner shown when spicy locked — PASS (mobile + web)
- [x] Spicy mode toggle in settings — PASS (mobile: profile/spicy-settings.tsx, web: settings/spicy/page.tsx)
- [x] TypeScript compiles — PASS (no new errors)

**Learnings:** Worktree agents wrote directly to working tree; no separate branch commits needed. Settings nav updated via new layout.tsx for web settings.
