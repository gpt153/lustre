# Roadmap: F04-SOCIAL-profiles

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Started:** 2026-03-24
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Profile Schema & API
**Status:** DONE (2026-03-24) — 40/40 tests pass, committed dae2e92

### Parallelization groups:
**Group A (sequential):**
- wave-1a-profile-schema (haiku) — **VERIFIED** — Prisma models: Profile, ProfilePhoto, KinkTag, ProfileKinkTag. Enums for gender, orientation, relationship type, seeking.
- wave-1b-profile-crud-api (haiku) — **VERIFIED** — tRPC procedures: profile.create, profile.update, profile.get, profile.getPublic. Input validation with Zod.

### Parallelization rationale:
- Sequential: API depends on schema

### Testgate Wave 1: **PASS** (40/40 tests)
- [x] Profile CRUD operations work via tRPC — PASS (16 tests)
- [x] All enum values stored correctly — PASS (5 tests)
- [x] Profile.getPublic excludes private fields — PASS
- Additional: age validation (7), input validation (8), edge cases (4)

---

## Wave 2: Photo Upload & Search
**Status:** IN_PROGRESS (started 2026-03-24)

### Parallelization groups:
**Group A (parallel):**
- wave-2a-photo-upload (haiku) — **VERIFIED** — R2 integration, multipart upload, WebP conversion, thumbnail generation (3 sizes), ProfilePhoto CRUD
- wave-2b-profile-search (haiku) — **VERIFIED** — Meilisearch indexing on profile create/update, search API with filters (gender, age, location, orientation)

**Group B (sequential, after A):**
- wave-2c-kink-tags (haiku) — **VERIFIED** — Kink tag system: 113 predefined tags in 9 categories, three interest levels, public/private visibility, tag search

### Parallelization rationale:
- A parallel: photo upload and search indexing are independent
- B sequential: kink tags need profile schema from wave 1 to be stable

### Testgate Wave 2: **PASS** (23/23 tests, 78 total)
- [x] Photo uploads to R2 successfully — PASS
- [x] Three thumbnail sizes generated — PASS
- [x] Meilisearch returns profiles matching filters — PASS
- [x] Kink tags assignable with interest levels — PASS
- Additional: photo CRUD, search pagination, kink visibility, integration

---

## Wave 3: Profile Screens & Pair Linking
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-profile-screens-mobile (haiku) — Onboarding wizard (5 steps), profile view screen, profile edit screen, photo gallery
- wave-3b-profile-screens-web (haiku) — Same screens for web

**Group B (sequential, after A):**
- wave-3c-pair-linking (haiku) — Pair invitation flow, confirmation, linked profile display, up to 5 people

### Parallelization rationale:
- A parallel: mobile and web screens independent
- B sequential: pair linking is enhancement on top of base profiles

### Testgate Wave 3:
- [ ] Onboarding wizard completes and creates profile
- [ ] Profile displays correctly with photos and tags
- [ ] Pair linking invitation and confirmation works
- [ ] Pair profile visible in search results
