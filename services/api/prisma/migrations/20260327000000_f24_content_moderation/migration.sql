-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('MESSAGE', 'POST', 'PROFILE');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('HARASSMENT', 'SPAM', 'UNDERAGE', 'NON_CONSENSUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('WARNING', 'TEMP_BAN', 'PERMANENT_BAN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "filtered_sent_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "warning_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "is_banned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "banned_until" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "message_content_tags" (
    "id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "dimension" "ContentTagDimension" NOT NULL,
    "value" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_content_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "description" VARCHAR(500),
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "action_type" "ModerationActionType" NOT NULL,
    "reason" VARCHAR(500),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_target_id_target_type_idx" ON "reports"("target_id", "target_type");

-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "moderation_actions_user_id_created_at_idx" ON "moderation_actions"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "message_content_tags" ADD CONSTRAINT "message_content_tags_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
