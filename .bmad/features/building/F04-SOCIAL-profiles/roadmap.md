# Roadmap: F04-SOCIAL-profiles

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Profile Schema & API
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-profile-schema (haiku) — Prisma models: Profile, ProfilePhoto, KinkTag, ProfileKinkTag. Enums for gender, orientation, relationship type, seeking. Migration.
- wave-1b-profile-crud-api (haiku) — tRPC procedures: profile.create, profile.update, profile.get, profile.getPublic. Input validation with Zod.

### Parallelization rationale:
- Sequential: API depends on schema

### Testgate Wave 1:
- [ ] Profile CRUD operations work via tRPC
- [ ] All enum values stored correctly
- [ ] Profile.getPublic excludes private fields

---

## Wave 2: Photo Upload & Search
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-photo-upload (haiku) — R2 integration, multipart upload, WebP conversion, thumbnail generation (3 sizes), ProfilePhoto CRUD
- wave-2b-profile-search (haiku) — Meilisearch indexing on profile create/update, search API with filters (gender, age, location, orientation)

**Group B (sequential, after A):**
- wave-2c-kink-tags (haiku) — Kink tag system: 100+ predefined tags in categories, three interest levels, public/private visibility, tag search

### Parallelization rationale:
- A parallel: photo upload and search indexing are independent
- B sequential: kink tags need profile schema from wave 1 to be stable

### Testgate Wave 2:
- [ ] Photo uploads to R2 successfully
- [ ] Three thumbnail sizes generated
- [ ] Meilisearch returns profiles matching filters
- [ ] Kink tags assignable with interest levels

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
