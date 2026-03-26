-- CreateEnum
CREATE TYPE "EducationCategory" AS ENUM ('ANATOMY', 'PLEASURE', 'STI_PREVENTION', 'MENTAL_HEALTH', 'RELATIONSHIPS', 'KINK_SAFETY', 'LGBTQ', 'AGING');

-- CreateEnum
CREATE TYPE "EducationAudience" AS ENUM ('ALL', 'WOMEN', 'MEN', 'NON_BINARY', 'COUPLES');

-- CreateTable
CREATE TABLE "education_topics" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "EducationCategory" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'sv',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "education_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_articles" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audience" "EducationAudience" NOT NULL DEFAULT 'ALL',
    "language" TEXT NOT NULL DEFAULT 'sv',
    "reading_time_minutes" INTEGER NOT NULL DEFAULT 5,
    "disclaimer" TEXT NOT NULL DEFAULT 'Denna information ersätter inte professionell medicinsk rådgivning.',
    "generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "education_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_podcasts" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audio_url" TEXT,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "audience" "EducationAudience" NOT NULL DEFAULT 'ALL',
    "language" TEXT NOT NULL DEFAULT 'sv',
    "host1_voice_id" TEXT NOT NULL DEFAULT 'ErXwobaYiN019PkySvjV',
    "host2_voice_id" TEXT NOT NULL DEFAULT '21m00Tcm4TlvDq8ikWAM',
    "generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "education_podcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_quizzes" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "audience" "EducationAudience" NOT NULL DEFAULT 'ALL',
    "language" TEXT NOT NULL DEFAULT 'sv',
    "questions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "education_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_article_reads" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_article_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quiz_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "education_topics_slug_key" ON "education_topics"("slug");

-- CreateIndex
CREATE INDEX "education_topics_category_idx" ON "education_topics"("category");

-- CreateIndex
CREATE INDEX "education_topics_language_idx" ON "education_topics"("language");

-- CreateIndex
CREATE UNIQUE INDEX "education_articles_topic_id_audience_language_key" ON "education_articles"("topic_id", "audience", "language");

-- CreateIndex
CREATE INDEX "education_articles_topic_id_idx" ON "education_articles"("topic_id");

-- CreateIndex
CREATE INDEX "education_articles_audience_idx" ON "education_articles"("audience");

-- CreateIndex
CREATE INDEX "education_articles_language_idx" ON "education_articles"("language");

-- CreateIndex
CREATE UNIQUE INDEX "education_podcasts_topic_id_language_key" ON "education_podcasts"("topic_id", "language");

-- CreateIndex
CREATE INDEX "education_podcasts_topic_id_idx" ON "education_podcasts"("topic_id");

-- CreateIndex
CREATE INDEX "education_quizzes_topic_id_idx" ON "education_quizzes"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_article_reads_user_id_article_id_key" ON "user_article_reads"("user_id", "article_id");

-- CreateIndex
CREATE INDEX "user_quiz_attempts_user_id_quiz_id_idx" ON "user_quiz_attempts"("user_id", "quiz_id");

-- AddForeignKey
ALTER TABLE "education_articles" ADD CONSTRAINT "education_articles_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "education_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_podcasts" ADD CONSTRAINT "education_podcasts_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "education_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_quizzes" ADD CONSTRAINT "education_quizzes_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "education_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_article_reads" ADD CONSTRAINT "user_article_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_article_reads" ADD CONSTRAINT "user_article_reads_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "education_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_attempts" ADD CONSTRAINT "user_quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_attempts" ADD CONSTRAINT "user_quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "education_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
