# Roadmap: F25-UX-dual-mode

**Status:** DONE — all waves implemented and tested
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
**Status:** DONE
**Started:** 2026-03-26T00:06:00Z
**Completed:** 2026-03-26T00:15:00Z

### Parallelization groups:
**Group A (parallel):**
- wave-2a-mode-toggle-mobile (haiku) — ModeToggle component, ModeWrapper, mobile spicy-settings update
- wave-2b-mode-toggle-web (haiku) — Same for web

### Epics:
| Epic | Status | Notes |
|------|--------|-------|
| wave-2a-mode-toggle-mobile | VERIFIED | ModeToggle, ModeWrapper, spicy-settings updated |
| wave-2b-mode-toggle-web | VERIFIED | web spicy/page, settings/layout mode badge, learn page |

### Testgate Wave 2: PASS
- [x] Toggle switches mode and UI updates immediately — ModeToggle calls useMode().setMode() with optimistic store update
- [x] Vanilla mode shows no explicit content — API filtering verified in Wave 1; UI uses ModeWrapper/isSpicy
- [x] Spicy mode reveals all features — spicy-settings and learn page show content when isSpicy=true
- [x] Default mode is vanilla for new users — modeStore defaults 'vanilla', Profile.spicyModeEnabled defaults false
- Note: same pre-existing tsc failures as Wave 1; all new files clean
