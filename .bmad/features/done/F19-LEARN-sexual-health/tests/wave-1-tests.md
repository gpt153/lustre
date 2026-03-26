# Tests: Wave 1 — Content Backend

## Testgate Checks

### T1-1: Schema migration
- [ ] `services/api/prisma/schema.prisma` contains EducationTopic, EducationArticle, EducationPodcast, EducationQuiz, UserArticleRead, UserQuizAttempt models
- [ ] `services/api/prisma/migrations/20260326120000_add_education_schema/migration.sql` exists and contains CREATE TABLE statements for all 6 tables

### T1-2: Topic seed data
- [ ] `services/api/prisma/seed.ts` contains education topic seed data
- [ ] At least 20 topics across all 8 categories

### T1-3: tRPC router
- [ ] `services/api/src/trpc/education-router.ts` exists with listTopics, listArticles, getArticle, listPodcasts, listQuizzes, getQuiz, submitQuiz, markArticleRead procedures
- [ ] `services/api/src/trpc/router.ts` registers educationRouter as `education`

### T1-4: Article generator
- [ ] `services/api/src/lib/education-ai.ts` exists with generateArticle function
- [ ] `services/api/scripts/generate-articles.ts` exists
- [ ] `@anthropic-ai/sdk` in services/api/package.json dependencies

### T1-5: Podcast generator
- [ ] `services/api/src/lib/podcast-generator.ts` exists with generatePodcastScript, synthesizePodcast, uploadPodcastToR2 functions
- [ ] `services/api/scripts/generate-podcasts.ts` exists

## Manual Integration Tests (run after deploy)

These require the API to be running with valid env vars:

### T1-6: Articles generated (20+)
Run: `npx tsx services/api/scripts/generate-articles.ts`
Expected: Script logs 20+ "Generated: <topic>" lines without errors

### T1-7: Articles in DB
Expected: `SELECT COUNT(*) FROM education_articles` returns >= 20

### T1-8: Articles tagged correctly
Expected: All articles have topicId, audience='ALL', language='sv', content length > 500 chars

### T1-9: Podcast generated (1 test episode)
Run: `npx tsx services/api/scripts/generate-podcasts.ts`
Expected: Script logs "Generated podcast: <title> → https://..." without errors

### T1-10: tRPC endpoints respond
Expected: `education.listTopics({})` returns array of 20+ topics
Expected: `education.listArticles({})` returns array of articles with titles
