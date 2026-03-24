# Roadmap: F25-UX-dual-mode

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 4

---

## Wave 1: Mode Backend & State
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-mode-state (haiku) — Prisma: UserSettings.mode (vanilla/spicy). Zustand mode state with persistence. tRPC: settings.getMode, settings.setMode.
- wave-1b-mode-filtering (haiku) — API-level mode filtering: all list/search queries respect caller's mode. Spicy content excluded from vanilla responses. Profile.getPublic hides kink tags in vanilla mode.

### Testgate Wave 1:
- [ ] Mode stored and persisted per user
- [ ] API queries filter content by mode
- [ ] Kink tags hidden in vanilla API responses

---

## Wave 2: Mode UI
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-mode-toggle-mobile (haiku) — Mode toggle component (header or settings), mode-aware screen wrappers, conditional rendering of spicy features
- wave-2b-mode-toggle-web (haiku) — Same for web

### Testgate Wave 2:
- [ ] Toggle switches mode and UI updates immediately
- [ ] Vanilla mode shows no explicit content
- [ ] Spicy mode reveals all features
- [ ] Default mode is vanilla for new users
