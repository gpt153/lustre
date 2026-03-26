# Epic: wave-1a-education-schema

**Wave:** 1 — Group A (parallel)
**Model:** haiku
**Status:** NOT_STARTED

## Goal

Add Prisma schema for sexual health education content: topics, articles, podcasts, quizzes, and user progress tracking. Seed 20+ topic records. Create tRPC education router with CRUD operations.

## Codebase Context

- **Prisma schema:** `services/api/prisma/schema.prisma` — all models use `@id @default(uuid()) @db.Uuid`, fields use `@map("snake_case")`, models use `@@map("snake_case_plural")`
- **Migration pattern:** `services/api/prisma/migrations/YYYYMMDDHHMISS_description/migration.sql` — last migration: `20260326000000_add_gamification`
- **Router pattern:** `services/api/src/trpc/` — use `router`, `protectedProcedure` from `./middleware.js`; registered in `services/api/src/trpc/router.ts`
- **Seed pattern:** `services/api/prisma/seed.ts` — use `prisma.model.upsert()` for idempotent seeding
- **Enums:** Define Prisma enums above the models that use them

## File Paths

1. `services/api/prisma/schema.prisma` — add enums + 6 new models
2. `services/api/prisma/migrations/20260326120000_add_education_schema/migration.sql` — migration SQL
3. `services/api/prisma/seed.ts` — add 20+ topic records
4. `services/api/src/trpc/education-router.ts` — new router
5. `services/api/src/trpc/router.ts` — register education router

## Schema to Add

### Enums (add to schema.prisma)
```
enum EducationCategory {
  ANATOMY
  PLEASURE
  STI_PREVENTION
  MENTAL_HEALTH
  RELATIONSHIPS
  KINK_SAFETY
  LGBTQ
  AGING
}

enum EducationAudience {
  ALL
  WOMEN
  MEN
  NON_BINARY
  COUPLES
}
```

### Models (add to schema.prisma)
```
EducationTopic
- id UUID PK
- slug String UNIQUE @map("slug")
- title String @map("title")
- description String @map("description")
- category EducationCategory @map("category")
- language String @default("sv") @map("language")
- order Int @default(0) @map("order")
- createdAt DateTime @default(now()) @map("created_at")
@@map("education_topics")
@@index([category])
@@index([language])

EducationArticle
- id UUID PK
- topicId UUID FK -> EducationTopic (cascade delete) @map("topic_id")
- title String @map("title")
- content String @db.Text @map("content")  (markdown)
- audience EducationAudience @default(ALL) @map("audience")
- language String @default("sv") @map("language")
- readingTimeMinutes Int @default(5) @map("reading_time_minutes")
- disclaimer String @default("Denna information ersätter inte professionell medicinsk rådgivning.") @map("disclaimer")
- generatedAt DateTime? @map("generated_at")
- createdAt DateTime @default(now()) @map("created_at")
@@map("education_articles")
@@index([topicId])
@@index([audience])
@@index([language])

EducationPodcast
- id UUID PK
- topicId UUID FK -> EducationTopic (cascade delete) @map("topic_id")
- title String @map("title")
- description String @map("description")
- audioUrl String? @map("audio_url")  (R2 URL)
- durationSeconds Int @default(0) @map("duration_seconds")
- audience EducationAudience @default(ALL) @map("audience")
- language String @default("sv") @map("language")
- host1VoiceId String @default("ErXwobaYiN019PkySvjV") @map("host1_voice_id")
- host2VoiceId String @default("21m00Tcm4TlvDq8ikWAM") @map("host2_voice_id")
- generatedAt DateTime? @map("generated_at")
- createdAt DateTime @default(now()) @map("created_at")
@@map("education_podcasts")
@@index([topicId])

EducationQuiz
- id UUID PK
- topicId UUID FK -> EducationTopic (cascade delete) @map("topic_id")
- title String @map("title")
- audience EducationAudience @default(ALL) @map("audience")
- language String @default("sv") @map("language")
- questions Json @map("questions")  (array of {question,options,correctIndex,explanation})
- createdAt DateTime @default(now()) @map("created_at")
@@map("education_quizzes")
@@index([topicId])

UserArticleRead
- id UUID PK
- userId UUID FK -> User (cascade delete) @map("user_id")
- articleId UUID FK -> EducationArticle (cascade delete) @map("article_id")
- readAt DateTime @default(now()) @map("read_at")
@@map("user_article_reads")
@@unique([userId, articleId])

UserQuizAttempt
- id UUID PK
- userId UUID FK -> User (cascade delete) @map("user_id")
- quizId UUID FK -> EducationQuiz (cascade delete) @map("quiz_id")
- score Int @map("score")  (0-100)
- answers Json @map("answers")
- completedAt DateTime @default(now()) @map("completed_at")
@@map("user_quiz_attempts")
@@index([userId, quizId])
```

## Seed Data (20+ topics, 2-3 per category)

In seed.ts, add after existing data:

**ANATOMY (3):** grundläggande anatomi, klitoris och nöje, prostata och nöje
**PLEASURE (3):** orgasm och nöje, masturbation och självkärlek, erogena zoner
**STI_PREVENTION (3):** STI-testning och förebyggande, kondomanvändning, PrEP och sexuell hälsa
**MENTAL_HEALTH (2):** sex och självkänsla, hantera sexuell ångest
**RELATIONSHIPS (3):** kommunikation om sex, gränser och samtycke, öppna relationer
**KINK_SAFETY (2):** BDSM-grunderna och säkerhet, samtycke och safewords
**LGBTQ (2):** queer-sexualitet och identitet, transpersoners sexuella hälsa
**AGING (2):** sex och åldrande, klimakteriet och sexualitet

## tRPC Router (education-router.ts)

Procedures:
- `listTopics` — protectedProcedure, optional input `{ category?: EducationCategory, language?: string }`, returns topics
- `listArticles` — protectedProcedure, input `{ topicSlug?: string, audience?: EducationAudience, language?: string }`, returns articles (content truncated to 500 chars for list view)
- `getArticle` — protectedProcedure, input `{ articleId: string }`, returns full article + checks UserArticleRead
- `listPodcasts` — protectedProcedure, input `{ topicSlug?: string }`, returns podcasts
- `listQuizzes` — protectedProcedure, input `{ topicSlug?: string }`, returns quizzes (no answers)
- `getQuiz` — protectedProcedure, input `{ quizId: string }`, returns quiz with questions
- `submitQuiz` — protectedProcedure, input `{ quizId: string, answers: number[] }`, calculates score, creates UserQuizAttempt, returns score
- `markArticleRead` — protectedProcedure, input `{ articleId: string }`, upserts UserArticleRead

## Acceptance Criteria

1. EducationCategory and EducationAudience enums added to schema.prisma
2. All 6 models added with correct FK relations and @@map annotations
3. migration.sql creates all tables with proper constraints, indexes, and CASCADE deletes
4. 20+ topics seeded covering all 8 categories
5. education.listTopics returns topics filterable by category and language
6. education.listArticles returns articles with topicSlug/audience/language filters
7. education.getArticle returns full content including disclaimer field
8. education.submitQuiz calculates score (correct answers / total * 100), creates UserQuizAttempt
9. education.markArticleRead upserts record (no duplicate error)
10. education router exported and registered as `education` in appRouter
