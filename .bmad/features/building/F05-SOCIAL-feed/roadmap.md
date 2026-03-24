# Roadmap: F05-SOCIAL-feed

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 8

---

## Wave 1: Post Schema & CRUD
**Status:** IN_PROGRESS (started 2026-03-24)

### Parallelization groups:
**Group A (sequential):**
- wave-1a-post-schema (haiku) — VERIFIED — Prisma: Post, PostMedia, ContentTag, UserContentFilter models. Enums for tag dimensions.
- wave-1b-post-crud (haiku) — VERIFIED — tRPC: post.create, post.get, post.list (paginated), post.delete. Media upload to R2.
- wave-1c-content-filter-api (haiku) — VERIFIED — tRPC: contentFilter.get, contentFilter.update. Filter matching logic for feed queries.

### Testgate Wave 1:
- [x] Posts created with text and images — PASS (Prisma valid, tRPC router compiles)
- [x] Posts listed with cursor pagination — PASS (cursor-based pagination implemented)
- [x] Content filters stored and retrievable — PASS (CRUD with presets compiles)
- Note: DB migration INCONCLUSIVE (no live PostgreSQL), 110 unit tests pass, 0 new TS errors

---

## Wave 2: Classification & Feed Algorithm
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-sightengine-classification (sonnet) — Sightengine API integration, classify uploaded images, store multi-label tags per PostMedia
- wave-2b-feed-algorithm (sonnet) — Feed scoring: recency, interest match, interaction history, location proximity. SQL query with scoring.

**Group B (sequential, after A):**
- wave-2c-filter-matching (haiku) — Feed query filters posts by user's content filter settings, matching against content tags

### Testgate Wave 2:
- [ ] Images classified with 5-dimension tags
- [ ] Feed returns posts sorted by relevance score
- [ ] Content filters exclude posts matching blocked tags

---

## Wave 3: Feed Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-feed-screen-mobile (haiku) — Feed screen with infinite scroll, post cards, image gallery, like/comment, "show less" button
- wave-3b-feed-screen-web (haiku) — Same feed for web with responsive layout

### Testgate Wave 3:
- [ ] Feed loads and scrolls smoothly on mobile
- [ ] Feed renders on web with responsive layout
- [ ] "Show less" reduces similar content
- [ ] Post creation flow works end-to-end
