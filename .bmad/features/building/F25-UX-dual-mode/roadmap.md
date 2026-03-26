# Roadmap: F25-UX-dual-mode

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Started:** 2026-03-26
**Waves:** 2
**Total epics:** 4

---

## Wave 1: Mode Backend & State
**Status:** DONE
**Started:** 2026-03-26T00:00:00Z
**Completed:** 2026-03-26T00:05:00Z

### Parallelization groups:
**Group A (sequential):**
- wave-1a-mode-state (haiku) — settings tRPC router (getMode/setMode backed by Profile.spicyModeEnabled), modeStore Zustand, useMode hook
- wave-1b-mode-filtering (haiku) — API-level mode filtering: feed, discovery, profile.getPublic

### Epics:
| Epic | Status | Notes |
|------|--------|-------|
| wave-1a-mode-state | VERIFIED | settings router, modeStore, useMode hook all correct |
| wave-1b-mode-filtering | VERIFIED | feed SQL filter, discovery spicyModeEnabled filter, profile.getPublic kinkTags hidden |

### Testgate Wave 1: PASS
- [x] Mode stored and persisted per user — settings-router.ts reads/writes Profile.spicyModeEnabled; modeStore persists to localStorage; useMode syncs remote→store
- [x] API queries filter content by mode — feed excludes MEDIUM/HIGH nudity posts for vanilla; discovery excludes spicy profiles for vanilla callers
- [x] Kink tags hidden in vanilla API responses — profile.getPublic returns kinkTags:[] for vanilla callers
- Note: global tsc fails on pre-existing infra issues (missing tamagui/react-native/medusa deps, other unbuilt features); all 6 target files have zero type errors

---

## Wave 2: Mode UI
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-mode-toggle-mobile (haiku) — ModeToggle component, ModeWrapper, mobile spicy-settings update
- wave-2b-mode-toggle-web (haiku) — Same for web

### Epics:
| Epic | Status | Notes |
|------|--------|-------|
| wave-2a-mode-toggle-mobile | NOT_STARTED | |
| wave-2b-mode-toggle-web | NOT_STARTED | |

### Testgate Wave 2:
- [ ] Toggle switches mode and UI updates immediately
- [ ] Vanilla mode shows no explicit content
- [ ] Spicy mode reveals all features
- [ ] Default mode is vanilla for new users
