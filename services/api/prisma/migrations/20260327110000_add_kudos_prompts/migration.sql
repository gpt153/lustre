-- CreateEnum
CREATE TYPE "KudosPromptStatus" AS ENUM ('PENDING', 'COMPLETED', 'DISMISSED');

-- CreateTable
CREATE TABLE "kudos_prompts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "match_id" UUID,
    "status" "KudosPromptStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kudos_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kudos_prompts_user_id_recipient_id_match_id_key" ON "kudos_prompts"("user_id", "recipient_id", "match_id");

-- CreateIndex
CREATE INDEX "kudos_prompts_user_id_status_idx" ON "kudos_prompts"("user_id", "status");

-- AddForeignKey
ALTER TABLE "kudos_prompts" ADD CONSTRAINT "kudos_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kudos_prompts" ADD CONSTRAINT "kudos_prompts_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kudos_prompts" ADD CONSTRAINT "kudos_prompts_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
