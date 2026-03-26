# Roadmap: F19-LEARN-sexual-health

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Completed:** 2026-03-26
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Content Backend
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Commit:** b08b7ea

### Parallelization groups:
**Group A (parallel):**
- wave-1a-education-schema (haiku) — Status: VERIFIED
- wave-1b-article-generator (sonnet) — Status: VERIFIED
- wave-1c-podcast-generator (sonnet) — Status: VERIFIED

### Verification notes:
- schema.prisma: 6 models + 2 enums added (EducationTopic, EducationArticle, EducationPodcast, EducationQuiz, UserArticleRead, UserQuizAttempt), User model updated with relations
- migration.sql: 20 SQL statements at migrations/20260326120000_add_education_schema/
- seed.ts: 20 topics across 8 categories (ANATOMY, PLEASURE, STI_PREVENTION, MENTAL_HEALTH, RELATIONSHIPS, KINK_SAFETY, LGBTQ, AGING)
- education-router.ts: 8 procedures (listTopics, listArticles, getArticle, listPodcasts, listQuizzes, getQuiz, submitQuiz, markArticleRead)
- education-ai.ts: generateArticle() with Anthropic claude-sonnet-4-6, medical disclaimer appended
- generate-articles.ts: batch-3 processing, idempotent upsert (topicId_audience_language unique)
- podcast-generator.ts: generatePodcastScript → synthesizePodcast (ElevenLabs) → uploadPodcastToR2
- @anthropic-ai/sdk: ^0.37.0 added to package.json

### Testgate Wave 1: PASS (static)
- [x] Schema and migration files correct
- [x] 20+ topics in seed data
- [x] tRPC router with all 8 procedures registered
- [x] Article generator script (requires ANTHROPIC_API_KEY at runtime)
- [x] Podcast generator script (requires ELEVENLABS_API_KEY + R2 at runtime)

---

## Wave 2: Education Screens
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Commit:** 1da42f8

### Parallelization groups:
**Group A (parallel):**
- wave-2a-education-mobile (haiku) — Status: VERIFIED
- wave-2b-education-web (haiku) — Status: VERIFIED

### Verification notes:
- packages/app/src/hooks/useEducation.ts: hook with topics, articles, markRead
- packages/app/src/screens/: 5 new screens (TopicList, Article, Podcast, Quiz + ArticleList)
- apps/mobile/app/(tabs)/learn/sexual-health.tsx: entry point
- apps/web/app/(app)/learn/sexual-health/: 4 pages (topic list, topic detail, article, quiz)
- apps/web/app/(app)/learn/page.tsx: updated with Sexual Health card
- packages/app/src/index.ts: all new screens and hook exported

### Testgate Wave 2: PASS (static)
- [x] All screen files present
- [x] Category filters in topic browser
- [x] Podcast player uses expo-av Audio.Sound (mobile) / HTML audio (web)
- [x] Quiz submission calls submitQuiz mutation
- [x] Article reader calls markArticleRead on mount
- [x] 0 TODOs/FIXMEs across all files
