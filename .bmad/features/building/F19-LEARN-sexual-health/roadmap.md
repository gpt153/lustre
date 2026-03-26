# Roadmap: F19-LEARN-sexual-health

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Content Backend
**Status:** IN_PROGRESS
**Started:** 2026-03-26

### Parallelization groups:
**Group A (parallel):**
- wave-1a-education-schema (haiku) — Prisma: EducationTopic, EducationArticle, EducationQuiz, EducationPodcast, UserEducationProgress. Topic categories from PRD. Status: VERIFIED
- wave-1b-article-generator (sonnet) — AI article generation pipeline: Claude generates articles per topic, stored in DB, tagged by audience/topic/language. Status: VERIFIED
- wave-1c-podcast-generator (sonnet) — ElevenLabs GenFM integration: generate dual-voice podcast episodes per topic, store audio in R2. Status: VERIFIED

### Verification notes:
- schema.prisma: 6 models + 2 enums added, User model updated with relations
- migration.sql: 20 SQL statements (CREATE TYPE, TABLE, INDEX, UNIQUE INDEX, FK constraints)
- seed.ts: 20 topics across 8 categories with correct upsert pattern
- education-router.ts: 8 procedures (listTopics, listArticles, getArticle, listPodcasts, listQuizzes, getQuiz, submitQuiz, markArticleRead)
- router.ts: education router registered
- education-ai.ts: generateArticle() with Anthropic claude-sonnet-4-6, bilingual, medical disclaimer appended
- generate-articles.ts: batch-3 processing, upsert with topicId_audience_language unique key
- podcast-generator.ts: generatePodcastScript, synthesizePodcast, uploadPodcastToR2, generateAndStorePodcast
- generate-podcasts.ts: generates 1 test episode for first topic
- @anthropic-ai/sdk: ^0.37.0 added to package.json
- 0 TODOs/FIXMEs

### Testgate Wave 1:
NOTE: Static code checks passed. Runtime tests require deployed API with ANTHROPIC_API_KEY and ELEVENLABS_API_KEY.
- [x] Schema and migration files correct (static)
- [x] 20+ topics in seed data (static)
- [x] tRPC router with all 8 procedures registered (static)
- [x] Article generator script exists with correct implementation (static)
- [x] Podcast generator script exists with correct implementation (static)
- [ ] 20+ articles generated and stored (requires runtime with ANTHROPIC_API_KEY)
- [ ] Podcast audio generated (requires runtime with ELEVENLABS_API_KEY + R2)

---

## Wave 2: Education Screens
**Status:** IN_PROGRESS
**Started:** 2026-03-26

### Parallelization groups:
**Group A (parallel):**
- wave-2a-education-mobile (haiku) — Topic browser, article reader, podcast player, quiz interface. Status: IN_PROGRESS
- wave-2b-education-web (haiku) — Same for web. Status: IN_PROGRESS

### Testgate Wave 2:
- [ ] Article browser works with topic filters
- [ ] Podcast player plays audio
- [ ] Quiz submission records answers
