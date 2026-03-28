-- CreateTable "ProfileTrustScore"
CREATE TABLE "profile_trust_scores" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kudos_score" INTEGER NOT NULL DEFAULT 0,
    "activity_score" INTEGER NOT NULL DEFAULT 0,
    "response_score" INTEGER NOT NULL DEFAULT 0,
    "profile_quality_score" INTEGER NOT NULL DEFAULT 0,
    "community_score" INTEGER NOT NULL DEFAULT 0,
    "safety_score" INTEGER NOT NULL DEFAULT 0,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "sparks_balance" INTEGER NOT NULL DEFAULT 0,
    "spotlight_credits" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_trust_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable "Spark"
CREATE TABLE "sparks" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sparks_pkey" PRIMARY KEY ("id")
);

-- CreateTable "Spotlight"
CREATE TABLE "spotlights" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spotlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_trust_scores_user_id_key" ON "profile_trust_scores"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sparks_sender_id_recipient_id_key" ON "sparks"("sender_id", "recipient_id");

-- AddForeignKey
ALTER TABLE "profile_trust_scores" ADD CONSTRAINT "profile_trust_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sparks" ADD CONSTRAINT "sparks_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sparks" ADD CONSTRAINT "sparks_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotlights" ADD CONSTRAINT "spotlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
